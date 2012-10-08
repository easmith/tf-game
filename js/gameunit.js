function gameUnit()
{
	var newImage = function (path) {
		var image = new Image();
		image.src = path;
		return image;
	}
	this.wave1 = newImage('images/wave1.png');
	this.wave2 = newImage('images/wave2.png');
	this.wave3 = newImage('images/wave3.png');
}

