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

		this.batching = false;
		this.batch = [];
	}

	Art.prototype.beginBatch = function() {
		this.batching = true;
	}

	Art.prototype.endBatch = function() {
		this.batching = false;
		while(this.batch.length > 0) {
			var f = this.batch.shift();
			f();
		}
	}

	Art.prototype.doOrQueue = function(f) {
		if (this.batching) {
			this.batch.push(f);
		} else {
			f();
		}
	}

	Art.prototype.setColor = function(c) {
		this.doOrQueue(function() {
			this.ctx.strokeStyle = c;
			this.ctx.fillStyle = c;
		}.bind(this))
	}

	Art.prototype.line = function(x1,y1,x2,y2) {
		this.doOrQueue(function() {
			this.ctx.beginPath();
			this.ctx.moveTo(x1,y1);
			this.ctx.lineTo(x2,y2);
			this.ctx.stroke();
		}.bind(this))
	}

	Art.prototype.spot = function(x,y,radius) {
		this.doOrQueue(function() {
			this.ctx.beginPath();
			this.ctx.arc(x,y,radius,0,Math.PI * 2);
			this.ctx.fill();
		}.bind(this))
	}

	Art.prototype.circle = function(x,y,radius) {
		this.doOrQueue(function() {
			this.ctx.beginPath();
			this.ctx.arc(x,y,radius,0,7);
			this.ctx.stroke();
		}.bind(this))
	}

	Art.prototype.box = function(x,y,width,height) {
		this.doOrQueue(function() {
			this.ctx.fillRect(x-0.5,y-0.5,width,height);
		}.bind(this))
	}

	Art.prototype.rectangle = function(x,y,width,height) {
		this.doOrQueue(function() {
			this.ctx.strokeRect(x-0.5,y-0.5,width,height);
		}.bind(this))
	}

	Art.prototype.image = function(x,y,path) {
        this.doOrQueue(function() {
			if (path.indexOf("://") == -1)
	            path = "assets/images/" + path

	        var img = window.getImgPromise(path);

	        if (img instanceof Promise) {
				return img.then(function(i) {
					this.ctx.drawImage(i, x, y);
				}.bind(this));
			} else {
				this.ctx.drawImage(img, x, y);			
			}
		}.bind(this))
	}

	Art.prototype.text = function(x,y,string) {
		this.doOrQueue(function() {
			this.ctx.fillText(string, x, y);
		}.bind(this))
	}

	Art.prototype.font = function(font) {
		this.doOrQueue(function() {
			this.ctx.font = font;
		}.bind(this))
	}

	Art.prototype.background = function(path) {
        this.doOrQueue(function() {
			if (path.indexOf("://") == -1)
	            path = "assets/backgrounds/" + path

			return window.getImgPromise(path).then(function(i) {
				this.ctx.drawImage(i, 0, 0, i.width, i.height, 0, 0, this.canvas.width, this.canvas.height);
			}.bind(this));
		}.bind(this))
	}

	Art.prototype.lineWidth = function(width) {
		this.doOrQueue(function() {
			this.ctx.lineWidth = width;
		}.bind(this))
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
		this.doOrQueue(function() {
			poly(this.ctx, vertices)
			this.ctx.stroke();
		}.bind(this))
	}

	Art.prototype.fillPolygon = function(vertices) {
		this.doOrQueue(function() {
			poly(this.ctx, vertices)
			this.ctx.fill();
		}.bind(this))
	}

	return Art;
});
