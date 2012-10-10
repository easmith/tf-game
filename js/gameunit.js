function backgroundUnit()
{
	var newImage = function (path) {
		var image = new Image();
		image.src = path;
		return image;
	}

	this.buffer = {}

	this.wave1 = newImage('images/wave1.png');
	this.wave2 = newImage('images/wave2.png');
	this.wave3 = newImage('images/wave3.png');

	this.cloud = newImage('images/cloud.png');
	this.clouds = newImage('images/clouds.png');
	this.clouds8 = newImage('images/clouds8.png');
	this.cloudss = newImage('images/cloudss.png');

	this.fishes75x50 = newImage('images/fishes75-50.png');
	this.fishes75x50r = newImage('images/fishes75-50r.png');

	this.fishes75x100 = newImage('images/fishes75-100.png');
	this.fishes75x100r = newImage('images/fishes75-100r.png');

	this.fishes50x75 = newImage('images/fishes50-75.png');
	this.fishes50x75r = newImage('images/fishes50-75r.png');

	this.fishes2 = newImage('images/fishes2.png');
	this.fishes2r = newImage('images/fishes2r.png');


	this.shipEmpty = newImage('images/ship-empty.png');
	this.tros = newImage('images/tros.png');

	this.fishXY = function(iterator, vx, vy, w, h)
	{
		this.x = Math.abs(iterator*vx % (w + 100) * 2 - (w + 100)) - 100;
		this.y = Math.abs(iterator*vy % (h - 320) * 2 - (h - 320)) + 200;
	}

	this.renderBackground = function(ctx, iterator)
	{
		//var delta = (date.getSeconds() * 1000 + date.getMilliseconds())/ 10;
		var waveDelta = Math.abs(iterator/2 % 25);

		ctx.drawImage(this.wave1, waveDelta - 25, 66);
		ctx.drawImage(this.wave2, -waveDelta, 80);
		var cloudIterator = iterator + 1000;

		ctx.drawImage(this.cloudss, cloudIterator/1.6 % (ctx.canvas.width + 150) - 75, 0);
		ctx.drawImage(this.clouds, cloudIterator/1.4 % (ctx.canvas.width + 100) - 75, 5);
		ctx.drawImage(this.cloud, cloudIterator/1.3 % (ctx.canvas.width + 100) - 75, 8);
		ctx.drawImage(this.clouds, cloudIterator/1.2 % (ctx.canvas.width + 75) - 75, 15);
		ctx.drawImage(this.clouds8, cloudIterator % (ctx.canvas.width + 75) - 75, 25);
		ctx.drawImage(this.shipEmpty, 512, Math.abs(iterator/4 % 4 - 2));
		ctx.drawImage(this.wave3, waveDelta - 25, 94);

		var fishPosition = new this.fishXY(iterator + 300, .5, .3, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(this.buffer['fish0'] > fishPosition.x ? this.fishes75x50 : this.fishes75x50r, fishPosition.x, fishPosition.y);
		this.buffer['fish0'] = fishPosition.x;

		fishPosition = new this.fishXY(iterator, 1.5, .5, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(this.buffer['fish1'] > fishPosition.x ? this.fishes50x75 : this.fishes50x75r, fishPosition.x, fishPosition.y);
		this.buffer['fish1'] = fishPosition.x;

		fishPosition = new this.fishXY(iterator + 500, 1, .7, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(this.buffer['fish2'] > fishPosition.x ? this.fishes50x75 : this.fishes50x75r, fishPosition.x, fishPosition.y);
		this.buffer['fish2'] = fishPosition.x;

		fishPosition = new this.fishXY(iterator + 100, 2, .2, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(this.buffer['fish3'] > fishPosition.x ? this.fishes50x75 : this.fishes50x75r, fishPosition.x, fishPosition.y);
		this.buffer['fish3'] = fishPosition.x;

		fishPosition = new this.fishXY(iterator + 1000, .5, .3, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(this.buffer['fish4'] > fishPosition.x ? this.fishes75x100 : this.fishes75x100r, fishPosition.x, fishPosition.y);
		this.buffer['fish4'] = fishPosition.x;

		fishPosition = new this.fishXY(iterator + 1500, .2, .1, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(this.buffer['fish5'] > fishPosition.x ? this.fishes2 : this.fishes2r, fishPosition.x, fishPosition.y);
		this.buffer['fish5'] = fishPosition.x;

		ctx.drawImage(this.tros, 592, 64);
	}
}

