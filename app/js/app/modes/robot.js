define([], function() {

	function redraw(ctx, map, state) {

		var widthPx = this.canvas.width;
		var heightPx = this.canvas.height;
		var widthCells = map.size[0];
		var heightCells = map.size[1];

		var cellSize = Math.floor(Math.min(widthPx / widthCells, heightPx / heightCells));

		var originX = Math.round(widthPx / 2 - cellSize * widthCells / 2)+0.5;
		var originY = Math.round(heightPx / 2 - cellSize * heightCells / 2)+0.5;

		// CLEAR

		ctx.clearRect(0,0,widthPx, heightPx);

		// DRAW GRID

		ctx.strokeStyle = '#ccc';
		for (var x = 0; x < widthCells; x++) {
			for (var y = 0; y < heightCells; y++) {
				ctx.strokeRect(originX + x * cellSize, originY + y * cellSize, cellSize, cellSize);
			}
		}

		// DRAW WALLS

		ctx.fillStyle = '#888';

		for(var i in map.walls) {
			var w = map.walls[i];
			ctx.fillRect(originX + w[0] * cellSize, originY + w[1] * cellSize, cellSize, cellSize);
		}

		// DRAW FRUIT

		ctx.fillStyle = '#f00';

		for(var i in state.fruit) {
			var f = state.fruit[i];

			ctx.beginPath();
			ctx.arc(originX + (f[0] + 0.5) * cellSize, originY + (f[1] + 0.5) * cellSize, cellSize * 0.4, 0, Math.PI * 2);
			ctx.fill();
		}

		// DRAW ROBOT

		ctx.fillStyle = '#00f';
		ctx.save();
		ctx.translate(originX + (state.pos[0] + 0.5) * cellSize, originY + (state.pos[1] + 0.5) * cellSize);
		ctx.rotate(Math.PI/2 * state.angle);
		ctx.beginPath();
		ctx.moveTo(0, -cellSize*0.4);
		ctx.lineTo(cellSize*0.3, cellSize*0.4);
		ctx.lineTo(-cellSize*0.3,cellSize*0.4);
		ctx.closePath();
		ctx.fill();

		ctx.restore();

	};

	var stateQueue = [];
	var queueTimeout = null;

	var Robot = function(canvas) {
		this.map = null;

		this.canvas = canvas;
		
		canvas.width = $(canvas).width();
		canvas.height = $(canvas).height();
		
		this.ctx = canvas.getContext("2d");

	};

	Robot.prototype.setMap = function(map) {
		this.map = map;
		redraw(this.ctx, map, map.initialState);
	};

	Robot.prototype.updateState = function(state) {
		console.log("Updating:", state);
		redraw(this.ctx, this.map, state);
	};

	Robot.prototype.moveLimitReached = function(state) {
		console.warn("Out of moves:", state.moves);
	}


	return Robot;
});


