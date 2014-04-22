var Logo = {
	move: function(distance)
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
	},
	
	turn: function(angle)
	{
		this.angle += angle;
		
		while (angle >= 360)
			angle -= 360;
		while (angle < 0)
			angle += 360;
	},
	
	penUp: function()
	{
		console.log("Pen Up");
	},
	
	penDown: function()
	{
		console.log("Pen Down");
	},
	
	showTurtle: function()
	{
		console.log("Show turtle");
	},
	
	hideTurtle: function()
	{
		console.log("Hide turtle");
	},
	
	color: function(c)
	{
		this._color = c;
	},
	
	speed: function(speed)
	{
		console.log("Speed", speed);
	},
	
	init: function(canvas)
	{
		this.canvas = canvas;
		
		canvas.width = $(canvas).width();
		canvas.height = $(canvas).height();
		
		this.x = canvas.width / 2;
		this.y = canvas.height / 2;
		this.angle = 270;
		
		this.ctx = canvas.getContext("2d");
		
		this.ctx.lineCap = "round";
		this.ctx.lineJoin = "round";
		this.ctx.lineWidth = 3;
		
		this.ctx.strokeStyle = "blue";
	},
	
}

