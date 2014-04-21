var $builtinmodule = function(name)
{
    var mod = {};
	
    mod.move = new Sk.builtin.func(function(distance) { // distance will be a Sk.builtin.nmbr
		postMessage({type: "eval", code: "Logo.move(" + distance.v + ")"});
    });
	
	mod.turn = new Sk.builtin.func(function(angle) {
		postMessage({type: "eval", code: "Logo.turn(" + angle.v + ")"});
	});
	
	mod.pen_down = new Sk.builtin.func(function() {
		postMessage({type: "eval", code: "Logo.penDown()"});
	});

	mod.pen_up = new Sk.builtin.func(function() {
		postMessage({type: "eval", code: "Logo.penUp()"});
	});

	mod.show_turtle = new Sk.builtin.func(function() {
		postMessage({type: "eval", code: "Logo.showTurtle()"});
	});

	mod.hide_turtle = new Sk.builtin.func(function() {
		postMessage({type: "eval", code: "Logo.hideTurtle()"});
	});

	mod.color = new Sk.builtin.func(function(a) {
		postMessage({type: "eval", code: "Logo.color(\""+ a.v + "\")"});
	});
	
	mod.speed = new Sk.builtin.func(function(a) {
		postMessage({type: "eval", code: "Logo.speed(" + a.v + ")"});
	});

	
    return mod;
}