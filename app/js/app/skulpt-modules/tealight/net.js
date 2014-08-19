var $builtinmodule = function(name)
{
    var mod = {};

    var ws = null;

    var queue = [];

    mod.connect = new Sk.builtin.func(function(app_name) {
        Sk.builtin.pyCheckArgs("connect", arguments, 1, 1);
        Sk.builtin.pyCheckType("app_name", "string", Sk.builtin.checkString(app_name));

        if (ws != null) {
            throw new Sk.builtin.Exception("Server already connected.");
        }

        Sk.misceval.print_("[Connecting to tealight server...]\n");
    	ws = new WebSocket("ws://tealight-server.herokuapp.com/" + Sk.ffi.remapToJs(app_name));

    	ws.onopen = function() {
    		onEvent("connected", {});
            Sk.misceval.print_("[Connected to tealight server]\n");

            while(queue.length > 0) {
                ws.send(queue.pop());
            }
    	};
    	ws.onerror = function() {
    		handleError(new Sk.builtin.Exception("Tealight network error"));
    		throw new Sk.builtin.Exception("Failed to connect to tealight server.");
    	};
    	ws.onmessage = function(e) {
    		onEvent("message", {message: JSON.parse(e.data)})
    	};
    });

    mod.send = new Sk.builtin.func(function(message, echo) {
        Sk.builtin.pyCheckArgs("send", arguments, 1, 2);

        if (!echo)
            echo = new Sk.builtin.bool(false);

        Sk.builtin.pyCheckType("echo", "boolean", Sk.builtin.checkBool(echo));

        var msg = Sk.ffi.remapToJs(message);

        var j = JSON.stringify({ 
            data: msg,
            echo: echo.v
        });

    	if (ws.readyState != ws.OPEN)
            queue.push(j);
        else
	    	ws.send(j);
    	
    });

	
    return mod;
}