var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.move = new Sk.builtin.func(function(distance) { // distance will be a Sk.builtin.nmbr    	
    	Sk.builtin.pyCheckArgs("move", arguments, 1, 1);
    	Sk.builtin.pyCheckType("distance", "number", Sk.builtin.checkNumber(distance));
    	rpc("move", 1, distance.v);
    });
	
	mod.turn = new Sk.builtin.func(function(angle) {
		rpc("turn", 1, angle.v);
	});
	
	mod.pen_down = new Sk.builtin.func(function() {
		rpc("penDown", 0);
	});

	mod.pen_up = new Sk.builtin.func(function() {
		rpc("penUp", 0);
	});

	mod.show_turtle = new Sk.builtin.func(function() {
		rpc("showTurtle", 0);
	});

	mod.hide_turtle = new Sk.builtin.func(function() {
		rpc("hideTurtle", 0);
	});

	mod.color = new Sk.builtin.func(function(c) {
		rpc("setColor", 0, c.v);
	});
	
	mod.speed = new Sk.builtin.func(function(s) {
		rpc("speed", 0, s.v);
	});

	
    return mod;
}