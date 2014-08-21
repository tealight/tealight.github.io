define([], function() {


	var Art = function(canvas) {
		this.canvas = canvas;
		
		canvas.width = $(canvas).width();
		canvas.height = $(canvas).height();
		
		this.ctx = canvas.getContext("2d");
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.lineWidth = 1;
		
		this.ctx.strokeStyle = "black";

		this.ctx.translate(0.5, 0.5);
		this.ctx.font = "20px sans-serif";
		this.ctx.textBaseline = "top";
	}

	Art.prototype.setColor = function(c) {
		this.ctx.strokeStyle = c;
		this.ctx.fillStyle = c;
	}

	Art.prototype.line = function(x1,y1,x2,y2) {
		this.ctx.beginPath();
		this.ctx.moveTo(x1,y1);
		this.ctx.lineTo(x2,y2);
		this.ctx.stroke();
	}

	Art.prototype.spot = function(x,y,radius) {
		this.ctx.beginPath();
		this.ctx.arc(x,y,radius,0,Math.PI * 2);
		this.ctx.fill();
	}

	Art.prototype.circle = function(x,y,radius) {
		this.ctx.beginPath();
		this.ctx.arc(x,y,radius,0,7);
		this.ctx.stroke();
	}

	Art.prototype.box = function(x,y,width,height) {
		this.ctx.fillRect(x-0.5,y-0.5,width,height);
	}

	Art.prototype.rectangle = function(x,y,width,height) {
		this.ctx.strokeRect(x-0.5,y-0.5,width,height);
	}

	Art.prototype.image = function(x,y,path) {
        if (path.indexOf("://") == -1)
            path = "assets/images/" + path

		return window.getImgPromise(path).then(function(i) {
			this.ctx.drawImage(i, x, y);
		}.bind(this));

	}

	Art.prototype.text = function(x,y,string) {
		this.ctx.fillText(string, x, y);
	}

	Art.prototype.font = function(font) {
		this.ctx.font = font;
	}

	Art.prototype.background = function(path) {
        if (path.indexOf("://") == -1)
            path = "assets/backgrounds/" + path

		return window.getImgPromise(path).then(function(i) {
			this.ctx.drawImage(i, 0, 0, i.width, i.height, 0, 0, this.canvas.width, this.canvas.height);
		}.bind(this));
	}

	Art.prototype.lineWidth = function(width) {
		this.ctx.lineWidth = width;
	}

	var poly = function(ctx, vertices) {
		ctx.beginPath();
		ctx.moveTo(vertices[0][0], vertices[0][1]);

		for (var i = 1; i < vertices.length; i++) {
			ctx.lineTo(vertices[i][0], vertices[i][1]);
		}

		ctx.closePath();
	}

	Art.prototype.polygon = function(vertices) {
		poly(this.ctx, vertices)
		this.ctx.stroke();
	}

	Art.prototype.fillPolygon = function(vertices) {
		poly(this.ctx, vertices)
		this.ctx.fill();
	}

	return Art;
});
