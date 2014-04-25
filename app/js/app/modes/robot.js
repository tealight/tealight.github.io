define([], function() {

	function redraw(map, state) {
		console.log("Redrawing map:", map, state)
	};

	var Robot = function(canvas) {
		this.map = null;

		this.canvas = canvas;
		
		canvas.width = $(canvas).width();
		canvas.height = $(canvas).height();
		
		this.ctx = canvas.getContext("2d");
	};

	Robot.prototype.setMap = function(map) {
		this.map = map;

		redraw(map, map.initialState);
	};

	Robot.prototype.updateState = function(state) {
		console.log("Updating state:", state);

		redraw(this.map, state);
	};

	return Robot;
});


