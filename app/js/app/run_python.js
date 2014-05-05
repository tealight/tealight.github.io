importScripts("../lib/skulpt/skulpt.js", "../lib/skulpt/skulpt-stdlib.js")

tealightModules = {};
params = {};

function OutOfMovesError() { }

var rpcQueue = [];
var lastRpcFlush = 0;
var rpcTimeStep = 0;
var rpcFlushTimeout = null;

function rpc(fn, duration) {
	var now = new Date().getTime();

	rpcQueue.push({fn: fn, timeStep: rpcTimeStep, args: Array.prototype.slice.call(arguments, 2)});
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

function onEvent(event, namedArgs) {
	var handlers = eventHandlers[event];

	for(var i in handlers) {
		var h  = handlers[i];

		var args = [];
		for(var j in h.func_code.co_varnames) {
			var v = namedArgs[h.func_code.co_varnames[j]] || null;

			if (v) {
				switch(typeof(v)) {
					case "number":
						args.push(Sk.builtin.nmber(v));
						break;
					case "string":
						args.push(Sk.builtin.str(v));
						break;
					default:
						handleError(new Error("Invalid event argument provided to worker. Unsupported type: " + typeof(v)));

						// Everything will die now, so might as well return

						return;
				}
			} else {
				args.push(null);
			}
		}
		try {
			Sk.misceval.apply(h,undefined,undefined,undefined,args);			
		} catch (e) {
			handleError(e);
			return;
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
			rpc("log", 0, 'Replaying cached 404 for', x);
			throw "File not found";
		}
		else
		{
			rpc("log", 0, "Retrieved", x, "from cache");
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
			rpc("log", 0, "Adding", url, "to cache");
			tealightModules[x] = http.responseText;
			postMessage({type: "module_cache", modules: tealightModules});
			return http.responseText;
		}
		else
		{
			tealightModules[x] = null;
			postMessage({type: "module_cache", modules: tealightModules});
			rpc("log", 0, "Caching 404 for", url);
		}

	}

	throw "File not found: '" + x + "'";
}

function stdout(text) {
	rpc("stdout", 0, text);
}

function handleError(e) {
	eventHandlers = {};

	if (e instanceof Sk.builtin.Exception) {
		postMessage({type: "python_error", message: e.toString(), line: e.lineno == "<unknown>" ? null : e.lineno, col: e.colno == "<unknown>" ? null : e.colno});
	} else if (e instanceof Error) {
		postMessage({type: "js_error", message: "JavaScript Error: " + e.message, stack: e.stack, line: Sk.currLineNo, col: Sk.currColNo});
	} else {
		postMessage({type: "error", message: "Unknown error:" + e.toString()});
	}
}

registeredHandlers = false;
function registerEventHandler(event, handler) {
	stdout("[Registering " + event + " handler.]\n");
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
					postMessage({type: "done"});
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
							onEvent("frame", {});
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
			onEvent(event.data.event, event.data.namedArgs);
			break;
	}
}
