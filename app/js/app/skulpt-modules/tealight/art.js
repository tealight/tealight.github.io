var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.color = new Sk.builtin.func(function(c) {
    	rpc("setColor", c.v);
    });

    mod.line = new Sk.builtin.func(function(x1, y1, x2, y2) {
    	rpc("line", x1.v, y1.v, x2.v, y2.v);
    });

    mod.spot = new Sk.builtin.func(function(x, y, radius) {
    	rpc("spot", x.v, y.v, radius.v);
    });

    mod.circle = new Sk.builtin.func(function(x, y, radius) {
    	rpc("circle", x.v, y.v, radius.v);
    });

    mod.box = new Sk.builtin.func(function(x, y, width, height) {
    	rpc("box", x.v, y.v, width.v, height.v);
    });

    mod.image = new Sk.builtin.func(function(x, y, path) {
    	rpc("image", x.v, y.v, path.v);
    });

    mod.text = new Sk.builtin.func(function(x, y, string) {
    	rpc("text", x.v, y.v, string.v);
    });

    mod.background = new Sk.builtin.func(function(path) {
    	rpc("background", path.v);
    });

    mod.clear = new Sk.builtin.func(function() {
    	rpc("clear");
    });


    mod.screenWidth = Sk.builtin.nmber(params.screenWidth || 0);
    mod.screenHeight = Sk.builtin.nmber(params.screenHeight || 0);

    return mod;
}