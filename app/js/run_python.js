importScripts("skulpt/skulpt.js", "skulpt/skulpt-stdlib.js")

tealightModules = {};

function ev(code)
{
	postMessage({type: "eval", code: code});
}

function runForever(fn) {
	setInterval(fn.func_code,10);
}

var eventHandlers = {};

function onEvent(event, namedArgs) {
	var handlers = eventHandlers[event];

	for(var i in handlers) {
		var h  = handlers[i];

		var args = [];
		for(var j in h.co_varnames) {
			var v = namedArgs[h.co_varnames[j]] || null;

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
		handlers[i].apply(null, args);
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

			var module = Sk.importMainWithBody("<stdin>", false, event.data.code);

			for(var n in module.$d) {
				if (n.indexOf("handle_") === 0 && module.$d[n].func_code) {
					registerEventHandler(n.substr(7), module.$d[n].func_code);
				}
			}

			eval(module);

			//postMessage({type: "done"});
			break;
		case "EVENT":
			onEvent(event.data.event, event.data.namedArgs);
			break;
	}
}
