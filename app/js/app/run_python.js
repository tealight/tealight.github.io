importScripts("../lib/skulpt/skulpt.js", "../lib/skulpt/skulpt-stdlib.js")

tealightModules = {};

function OutOfMovesError() { }

function ev(code)
{
	postMessage({type: "eval", code: code});
}

function rpc(fn) {
	postMessage({type: "rpc", fn: fn, args: Array.prototype.slice.call(arguments, 1)});
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
						output("INVALID EVENT ARGUMENT TYPE: " + typeof(v) + "\n");
						args.push(null);
						break;
				}
			} else {
				args.push(null);
			}
		}
		Sk.misceval.apply(h,undefined,undefined,undefined,args);
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
			ev("console.log('Replaying cached 404 for', \"" + x + "\");");
			throw "File not found";
		}
		else
		{
			ev("console.log('Retrieved', \"" + x + "\", 'from cache');");
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
			ev("console.log('Adding', \"" + url + "\", 'to cache');");
			tealightModules[x] = http.responseText;
			postMessage({type: "module_cache", modules: tealightModules});
			return http.responseText;
		}
		else
		{
			tealightModules[x] = null;
			postMessage({type: "module_cache", modules: tealightModules});
			ev("console.warn('Caching 404 for ', \"" + url + "\");");
		}

	}

	throw "File not found: '" + x + "'";
}

function output(text) {
	postMessage({type: "stdout", message: text});	
}

function registerEventHandler(event, handler) {
	output("[Registering " + event + " handler.]\n");

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
			Sk.configure({
				output: output,
				read: builtinRead,
				syspath: ["skulpt-modules"]
			});

			try {
				var module = Sk.importMainWithBody("<stdin>", false, event.data.code);
			} catch (e) {
				if (e instanceof OutOfMovesError) {
					output("Run out of moves!\n");
					postMessage({type: "done"});
					return;
				} else {
					if (e instanceof Error) 
						postMessage({type: "error", message: e.message, stack: e.stack});
					else
						postMessage({type: "error", message: "" + e});

					return;					
				}
			}

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

			eval(module);

			break;
		case "EVENT":
			onEvent(event.data.event, event.data.namedArgs);
			break;
	}
}
