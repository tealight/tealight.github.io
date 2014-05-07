define([], function() {

	function redraw() {

		this.state = this.state || this.map.initialState;

		var widthPx = this.canvas.width;
		var heightPx = this.canvas.height;
		var gridHeightPx = heightPx - 50;
		var widthCells = this.map.size[0];
		var heightCells = this.map.size[1];

		var cellSize = Math.floor(Math.min(widthPx / widthCells, gridHeightPx / heightCells));

		var originX = Math.round(widthPx / 2 - cellSize * widthCells / 2)+0.5;
		var originY = Math.round(gridHeightPx / 2 - cellSize * heightCells / 2)+0.5;

		// CLEAR

		this.ctx.clearRect(0,0,widthPx, heightPx);

		// DRAW GRID

		this.ctx.strokeStyle = '#ccc';
		this.ctx.lineWidth = 1;
		for (var x = 0; x < widthCells; x++) {
			for (var y = 0; y < heightCells; y++) {
				this.ctx.strokeRect(originX + x * cellSize, originY + y * cellSize, cellSize, cellSize);
			}
		}

		// DRAW WALLS

		this.ctx.fillStyle = '#888';

		for(var i in this.map.walls) {
			var w = this.map.walls[i];
			this.ctx.fillRect(originX + w[0] * cellSize, originY + w[1] * cellSize, cellSize, cellSize);
		}

		// DRAW FRUIT
		if (this.fruitImg) {
			for(var i in this.state.fruit) {
				var f = this.state.fruit[i];
				var x = originX + (f[0] + 0.5) * cellSize;
				var y = originY + (f[1] + 0.5) * cellSize;
				var imgSize = cellSize * 0.9

				this.ctx.drawImage(this.fruitImg, 0, 0, this.fruitImg.width, this.fruitImg.height, x - imgSize / 2, y - imgSize / 2, imgSize, imgSize);
			}
		}
		
		// DRAW ROBOT

		this.ctx.fillStyle = '#00f';
		this.ctx.save();
		this.ctx.translate(originX + (this.state.pos[0] + 0.5) * cellSize, originY + (this.state.pos[1] + 0.5) * cellSize);
		this.ctx.rotate(Math.PI/2 * this.state.angle);
		this.ctx.beginPath();
		this.ctx.moveTo(0, -cellSize*0.4);
		this.ctx.lineTo(cellSize*0.3, cellSize*0.4);
		this.ctx.lineTo(-cellSize*0.3,cellSize*0.4);
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.restore();

		// DRAW SCORE

		this.ctx.font = "20px sans-serif";
		this.ctx.fillStyle = "#007";
		this.ctx.textBaseline = "bottom";
		this.ctx.textAlign = "left";
		this.ctx.fillText("Score: " + this.state.score + " / " + this.map.target, widthPx / 2 + 50, heightPx - 20);

		this.ctx.textAlign = "right";
		this.ctx.fillText("Moves: " + this.state.moves + " / " + this.map.limit, widthPx / 2 - 50, heightPx - 20);

		// DRAW BANNER

		var bannerText = null;
		if (this.state.score >= this.map.target)
			bannerText = "You win!";
		else if (this.state.moves >= this.map.limit)
			bannerText = "Game over. You scored " + this.state.score + ".";

		if (bannerText) {
			this.ctx.globalAlpha = 0.8;
			this.ctx.font = "50px sans-serif";

			var boxWidth = this.ctx.measureText(bannerText).width + 100;
			var boxHeight = 100;

			this.ctx.fillStyle = "#8f8";
			this.ctx.fillRect(widthPx / 2 - boxWidth / 2, gridHeightPx / 2 - boxHeight / 2, boxWidth, boxHeight);

			this.ctx.strokeStyle = "#f88";
			this.ctx.lineWidth = 5;
			this.ctx.strokeRect(widthPx / 2 - boxWidth / 2, gridHeightPx / 2 - boxHeight / 2, boxWidth, boxHeight);

			this.ctx.fillStyle = "#007";
			this.ctx.textBaseline = "middle";
			this.ctx.textAlign = "center";
			this.ctx.fillText(bannerText, widthPx / 2, gridHeightPx / 2);
			this.ctx.globalAlpha = 1;
		}
	};

	var stateQueue = [];
	var queueTimeout = null;

	var Robot = function(canvas, map) {
		this.map = map;

		this.canvas = canvas;
		
		canvas.width = $(canvas).width();
		canvas.height = $(canvas).height();
		
		this.ctx = canvas.getContext("2d");

		this.redraw = redraw.bind(this);

		window.getImgPromise("assets/gfx/" + map.fruitIcon).then((function(i) {
			this.fruitImg = i;
			this.redraw();
		}).bind(this));
	};

	Robot.prototype.updateState = function(state) {
		this.state = state;
		this.redraw();
	};

	Robot.prototype.moveLimitReached = function(state) {
		this.redraw();
		console.warn("Out of moves:", state.moves);
	}


	return Robot;
});


