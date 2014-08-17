define([], function() {


	var Logo = function(canvas) {
		this.canvas = canvas;
		
		canvas.width = $(canvas).width();
		canvas.height = $(canvas).height();
		
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;
		this.angle = 270;
		
		this.ctx = canvas.getContext("2d");
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.lineWidth = 1;
		
		this.ctx.strokeStyle = "blue";
	}

	Logo.prototype.move = function(distance)
	{
		var targetX = this.x + Math.cos(Math.PI * this.angle / 180) * distance;
		var targetY = this.y + Math.sin(Math.PI * this.angle / 180) * distance;
		
		this.ctx.strokeStyle = this._color;
		
		this.ctx.beginPath();
		this.ctx.moveTo(Math.round(this.x)-0.5, Math.round(this.y)-0.5);
		this.ctx.lineTo(Math.round(targetX)-0.5, Math.round(targetY)-0.5);
		this.ctx.stroke();
		
		this.x = targetX;
		this.y = targetY;
	};

	Logo.prototype.turn = function(angle) {
		this.angle += angle;
		
		while (this.angle >= 360)
			this.angle -= 360;
		while (this.angle < 0)
			this.angle += 360;
	};
		
	Logo.prototype.penUp = function() {
		throw new Error("Function not implemented");
	};
		
	Logo.prototype.penDown = function() {
		throw new Error("Function not implemented");
	};
		
	Logo.prototype.showTurtle = function() {
		throw new Error("Function not implemented");
	};
		
	Logo.prototype.hideTurtle = function() {
		throw new Error("Function not implemented");
	};
		
	Logo.prototype.speed = function(speed) {
		throw new Error("Function not implemented");
	};
		
	Logo.prototype.setColor = function(c) {
		this._color = c;
	};
				
	return Logo;

});
