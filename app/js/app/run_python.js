importScripts("../lib/skulpt/skulpt.js", "../lib/skulpt/skulpt-stdlib.js")

tealightModules = {};
params = {};

function OutOfMovesError(state) { this.state = state; }

function log() {
	rpc.apply(null, ["log", 0].concat(Array.prototype.slice.call(arguments, 0)));
	rpcFlush();
}

var rpcQueue = [];
var lastRpcFlush = 0;
var rpcTimeStep = 0;
var rpcFlushTimeout = null;

function rpc(fn, duration) {
	var now = new Date().getTime();

	rpcQueue.push({fn: fn, timeStep: rpcTimeStep, args: Array.prototype.slice.call(arguments, 2), line: Sk.currLineNo, col: Sk.currColNo});
	rpcTimeStep += duration;

	if (now - lastRpcFlush > 20) {
		rpcFlush();
	} else {
		clearTimeout(rpcFlushTimeout);
		rpcFlushTimeout = setTimeout(rpcFlush, 20);
	}

}

function rpcFlush() {
	postMessage({type:"rpc", queue: rpcQueue});
	rpcQueue = [];
	lastRpcFlush = new Date().getTime();
	clearTimeout(rpcFlushTimeout);
	rpcFlushTimeout = null;
}

var eventHandlers = {};

function onEvent(event, args) {
	var handlers = eventHandlers[event];

	for(var i in handlers) {
		var h  = handlers[i];

		// Convert args to python objects

		for (var j in args) {
			args[j] = Sk.ffi.remapToPy(args[j]);
		}

		// Remove any args not required by the handler function

		var requiredArgCount = (h.func_code.co_varnames || []).length;
		args.splice(requiredArgCount);

		// Call the handler function.

		try {
			rpc("beginBatch", 0);
			Sk.misceval.apply(h,undefined,undefined,undefined,args);			
		} catch (e) {
			handleError(e);
			return;
		} finally {
			rpc("endBatch", 0);
		}
	}
}

function builtinRead(x) {

	if (Sk.builtinFiles && Sk.builtinFiles["files"][x])
		return Sk.builtinFiles["files"][x]

	// If the file is in the cache, return it.
	if (tealightModules[x] !== undefined)
	{
		if (tealightModules[x] === null)
		{
			//log('Replaying cached 404 for', x);
			throw "File not found";
		}
		else
		{
			//log("Retrieved", x, "from cache");
			return tealightModules[x];
		}
	}


	if (x.indexOf("skulpt-modules/") > -1)
	{
		var http = new XMLHttpRequest();
		var url = x;

		http.open("GET", url, false);
		http.send(null);

		if (http.status == 200)
		{
			log("Adding", url, "to cache");
			tealightModules[x] = http.responseText;
			postMessage({type: "module_cache", modules: tealightModules});
			return http.responseText;
		}
		else
		{
			tealightModules[x] = null;
			postMessage({type: "module_cache", modules: tealightModules});
			log("Caching 404 for", url);
		}

	} else if (x.indexOf("github") > -1) {

		//console.warn("X: " + x);
		var re = /\.\/github\/__init__.py/;

		if (x.match(re)) {
			return "";
		}

		re = /\.\/github\/([^\/]+)\/__init__.py/;

		if (m = x.match(re)) {
			//console.warn(m[1]);
			return "";
		}

		re = /\.\/github\/([^\/]+)\/([^\/]+)\/__init__.py/;

		if (m = x.match(re)) {
			//console.warn(m[2])
			return "";
		}

		re = /\.\/github\/([^\/]+)\/([^\/]+)\/([^\/]+).py/;
		if (m = x.match(re)) {
			var repoOwner = m[1];
			var mode = m[2];
			var file = m[3];

			console.warn("GITHUB READ: "+ repoOwner + " : " + mode + " : " + file);

			var http = new XMLHttpRequest();
			var url = "https://api.github.com/repos/" + repoOwner + "/tealight-files/contents/" + mode + "/" + file + ".py?access_token=" + params.githubToken;

			http.open("GET", url, false);
			http.send(null);

			if (http.status == 200) {
				var py = atob(JSON.parse(http.responseText).content.replace("\n", ""));

				return py;
			}
		}
	}

	throw "File not found: '" + x + "'";
}

function stdout(text) {
	rpc("stdout", 0, text);
}

function handleError(e) {
	eventHandlers = {};

	try {
		stdout("Error in " + e.args.v[1].v + "\n")
	} catch (e) {}

	if (e instanceof Sk.builtin.Exception) {
		rpc("python_error", 0, {message: e.toString(), line: e.lineno == "<unknown>" ? null : e.lineno, col: e.colno == "<unknown>" ? null : e.colno});
	} else if (e instanceof Error) {
		rpc("js_error", 0, {message: "JavaScript Error: " + e.message, stack: e.stack, line: Sk.currLineNo, col: Sk.currColNo});
	} else {
		rpc("error", 0, {message: "Unknown error:" + e.toString()});
	}
}

registeredHandlers = false;
function registerEventHandler(event, handler) {
	stdout("[Registering " + event + " handler]\n");
	registeredHandlers = true;

	if (!eventHandlers[event])
		eventHandlers[event] = [];

	eventHandlers[event].push(handler);
}

self.onmessage = function(event) {

	switch (event.data.type)
	{
		case "MODULES":
			tealightModules = event.data.modules;
			break;
		case "RUN":
			params = event.data.params;

			Sk.configure({
				output: stdout,
				read: builtinRead,
				syspath: ["skulpt-modules"]
			});

			// LOAD THE CODE
			try {
				var module = Sk.importMainWithBody("<stdin>", false, event.data.code);
			} catch (e) {
				if (e instanceof OutOfMovesError) {
					stdout("Run out of moves!\n");
					rpc("moveLimitReached", 0, e.state);
					return;
				} else {
					handleError(e);

					return;					
				}
			}

			// CAPTURE EVENT HANDLERS

			for(var n in module.$d) {
				if (n.indexOf("handle_") === 0 && module.$d[n].func_code) {
					var eventName = n.substr(7);
					registerEventHandler(eventName, module.$d[n]);

					if (eventName == "frame") {

						// Someone is trying to handle "frame" events, so make sure we generate them.

						setInterval(function() {
							onEvent("frame", []);
						}, 20); // 50 FPS
					}
				}
			}

			// EVAL THE CODE. NOT SURE WHAT THIS DOES (!)
			try {
				eval(module);
			} catch(e) {
				handleError(e);
				return;
			}

			// IF NO EVENT HANDLERS, SIGNAL THAT WE'RE DONE.

			if(!registeredHandlers)
				rpc("done");

			break;
		case "EVENT":
			onEvent(event.data.event, event.data.args);
			break;
	}
}
