define([], function() {

	var imageCache = {};

	function getImgPromise(path) {
		if (!imageCache[path]) {
			console.log("Caching art img:", path);
			imageCache[path] = new Promise(function(resolve, reject) {
				var img = $("<img/>").attr("src", "artimg/" + path);
				img.on("load", function() {
					resolve(img[0]);
				});
			});
		}

		return imageCache[path];
	}

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

	Art.prototype.image = function(x,y,path) {

		return getImgPromise(path).then(function(i) {
			this.ctx.drawImage(i, x, y);
		}.bind(this));

	}

	Art.prototype.text = function(x,y,string) {
		this.ctx.fillText(string, x, y);
	}

	Art.prototype.background = function(path) {
		return getImgPromise(path).then(function(i) {
			this.ctx.drawImage(i, 0, 0, i.width, i.height, 0, 0, this.canvas.width, this.canvas.height);
		}.bind(this));
	}

	return Art;
});