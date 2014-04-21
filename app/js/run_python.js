importScripts("skulpt/skulpt.js", "skulpt/skulpt-stdlib.js")

tealightModules = {};

function ev(code)
{
	postMessage({type: "eval", code: code});
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

self.onmessage = function(event) {

	switch (event.data.type)
	{
		case "MODULES":
			tealightModules = event.data.modules;
			break;
		case "RUN":
			Sk.configure({
				output: function(text) {
					postMessage({type: "stdout", message: text});

				},
				read: builtinRead,
				syspath: ["skulpt-modules"]
			});

			eval(Sk.importMainWithBody("<stdin>", false, event.data.code));
			postMessage({type: "done"});
			break;
	}
}
