var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.color = new Sk.builtin.func(function(c) {
        Sk.builtin.pyCheckArgs("color", arguments, 1, 1);
        Sk.builtin.pyCheckType("c", "string", Sk.builtin.checkString(c));

    	rpc("setColor", 0, c.v);
    });

    mod.line = new Sk.builtin.func(function(x1, y1, x2, y2) {
        Sk.builtin.pyCheckArgs("line", arguments, 4, 4);
        Sk.builtin.pyCheckType("x1", "number", Sk.builtin.checkNumber(x1));
        Sk.builtin.pyCheckType("x2", "number", Sk.builtin.checkNumber(x2));
        Sk.builtin.pyCheckType("y1", "number", Sk.builtin.checkNumber(y1));
        Sk.builtin.pyCheckType("y2", "number", Sk.builtin.checkNumber(y2));

    	rpc("line", 1, x1.v, y1.v, x2.v, y2.v);
    });

    mod.spot = new Sk.builtin.func(function(x, y, radius) {
        Sk.builtin.pyCheckArgs("spot", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("radius", "number", Sk.builtin.checkNumber(radius));

    	rpc("spot", 1, x.v, y.v, radius.v);
    });

    mod.circle = new Sk.builtin.func(function(x, y, radius) {
        Sk.builtin.pyCheckArgs("circle", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("radius", "number", Sk.builtin.checkNumber(radius));

    	rpc("circle", 1, x.v, y.v, radius.v);
    });

    mod.box = new Sk.builtin.func(function(x, y, width, height) {
        Sk.builtin.pyCheckArgs("box", arguments, 4, 4);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("width", "number", Sk.builtin.checkNumber(width));
        Sk.builtin.pyCheckType("height", "number", Sk.builtin.checkNumber(height));

    	rpc("box", 1, x.v, y.v, width.v, height.v);
    });

    mod.image = new Sk.builtin.func(function(x, y, path) {
        Sk.builtin.pyCheckArgs("image", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));
        Sk.builtin.pyCheckType("path", "string", Sk.builtin.checkString(path));

    	rpc("image", 1, x.v, y.v, path.v);
    });

    mod.text = new Sk.builtin.func(function(x, y, string) {
        Sk.builtin.pyCheckArgs("text", arguments, 3, 3);
        Sk.builtin.pyCheckType("x", "number", Sk.builtin.checkNumber(x));
        Sk.builtin.pyCheckType("y", "number", Sk.builtin.checkNumber(y));

        // Don't check type of string argument. It can probably be just about anything.

    	rpc("text", 1, x.v, y.v, string.v);
    });

    mod.background = new Sk.builtin.func(function(path) {
        Sk.builtin.pyCheckArgs("background", arguments, 1, 1);
        Sk.builtin.pyCheckType("path", "string", Sk.builtin.checkString(path));

    	rpc("background", 1, path.v);
    });

    mod.clear = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("clear", arguments, 0, 0);

    	rpc("clear", 1);
    });

    mod.screen_width = Sk.builtin.nmber(params.screenWidth || 0);
    mod.screen_height = Sk.builtin.nmber(params.screenHeight || 0);

    return mod;
}