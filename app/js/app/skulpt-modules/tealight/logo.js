var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.move = new Sk.builtin.func(function(distance) { // distance will be a Sk.builtin.nmbr
    	if (!distance)
    		throw Error("blah");
    	rpc("move", distance.v);
    });
	
	mod.turn = new Sk.builtin.func(function(angle) {
		rpc("turn", angle.v);
	});
	
	mod.pen_down = new Sk.builtin.func(function() {
		rpc("penDown");
	});

	mod.pen_up = new Sk.builtin.func(function() {
		rpc("penUp");
	});

	mod.show_turtle = new Sk.builtin.func(function() {
		rpc("showTurtle");
	});

	mod.hide_turtle = new Sk.builtin.func(function() {
		rpc("hideTurtle");
	});

	mod.color = new Sk.builtin.func(function(c) {
		rpc("setColor", c.v);
	});
	
	mod.speed = new Sk.builtin.func(function(s) {
		rpc("speed", s.v);
	});

	
    return mod;
}