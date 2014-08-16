var $builtinmodule = function(name)
{
    var mod = {};

    var ws = null;

    mod.connect = new Sk.builtin.func(function(app_name) {
    	ws = new WebSocket("ws://localhost:9090/" + Sk.ffi.remapToJs(app_name));

    	ws.onopen = function() {
    		onEvent("connected", {});
    	};
    	ws.onerror = function() {
    		handleError(new Sk.builtin.Exception("Tealight network error"));
    		throw new Sk.builtin.Exception("Failed to connect to tealight server.");
    	};
    	ws.onmessage = function(e) {
    		onEvent("message", {message: JSON.parse(e.data)})
    	};
    });

    mod.send = new Sk.builtin.func(function(message) {

    	var msg = Sk.ffi.remapToJs(message);
    	var j = JSON.stringify(msg);

    	ws.send(j);
    });

	
    return mod;
}