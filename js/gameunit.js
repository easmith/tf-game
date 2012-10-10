function backgroundUnit()
{
	var self = this;
	this.init = function()
	{
		var iterator = 0;

		var backCanvas = document.getElementById("backCanvas");
		var ctx = backCanvas.getContext('2d');  // Контекст холста
		ctx.canvas.width = 716;
		ctx.canvas.height = 597;
		var self = this;
		setInterval(function(){
//			console.log(self);
			self.renderBackground(ctx, iterator++)
		}, 50);
	}

	var newImage = function (path) {
		var image = new Image();
		image.src = path;
		return image;
	}

	this.buffer = {}

	this.images = {
		wave1 : newImage('images/wave1.png'),
		wave2 : newImage('images/wave2.png'),
		wave3 : newImage('images/wave3.png'),

		cloud : newImage('images/cloud.png'),
		clouds : newImage('images/clouds.png'),
		clouds8 : newImage('images/clouds8.png'),
		cloudss : newImage('images/cloudss.png'),

		fishes75x50 : newImage('images/fishes75-50.png'),
		fishes75x50r : newImage('images/fishes75-50r.png'),

		fishes75x100 : newImage('images/fishes75-100.png'),
		fishes75x100r : newImage('images/fishes75-100r.png'),

		fishes50x75 : newImage('images/fishes50-75.png'),
		fishes50x75r : newImage('images/fishes50-75r.png'),

		fishes2 : newImage('images/fishes2.png'),
		fishes2r : newImage('images/fishes2r.png'),

		shipEmpty : newImage('images/ship-empty.png'),

		diverdown: newImage('images/Diver-tros.png'),
		diverleft: newImage('images/Diver-go-harvest.png'),
		diverright: newImage('images/Diver-go-home.png'),
		diverup: newImage('images/Diver-tros-up.png'),

		star1: newImage('images/tf-star1.png'),
		star2: newImage('images/tf-star2.png'),
		star3: newImage('images/tf-star3.png'),
		star4: newImage('images/tf-star4.png'),
		star5: newImage('images/tf-star5.png'),
		star6: newImage('images/tf-star6.png'),
		star7: newImage('images/tf-star7.png'),
		star8: newImage('images/tf-star8.png'),
		star9: newImage('images/tf-star9.png'),
		star10: newImage('images/tf-star10.png'),

		tros : newImage('images/tros.png')
	}

	this.divers = [];
	this.stars = [];

	this.addDiver = function()
	{
		this.divers.push(new this.diver());
	}

	this.addStar = function(x, y)
	{
		if (this.stars.length < 20)
			this.stars.push(new this.star(x, y));
	}

	this.star = function(x, y){
		this.state = 'd'; // d, w (wait)
		this.position = {'x' : x, 'y' : y};
		this.value = Math.round(Math.random() * 11);
		this.img = self.images['star' + this.value];

		this.newPosition = function()
		{
			switch (this.state) {
				case 'd': {
					if (this.position.y > 515) { this.state = 'w'; this.position.y += Math.round(Math.random() * 10); }
					this.position.y += 4;
				}
			}
		}

		this.render = function (ctx)
		{
			try {
				if (typeof( this.position) != 'object') return;
				this.newPosition();
				var p = this.position;
				ctx.drawImage(this.img,	p.x, p.y);
			}catch(e){console.log(p)}
		}
	}

	this.diver = function(){
		this.state = "d"; // d, u, l, r, z (zapravka)
		this.oxygen = 20000;
		this.haveStar = [{name: 'star1', value: 5}, {name:'star2', value: 10}];
		this.foundStar = [];
		this.position = {x : 585, y : 100};
		this.img = self.images.diverdown;

		this.changeDirection = function(direct)
		{
			this.state = direct;
			switch (direct) {
				case 'd': { this.img = self.images.diverdown; break; }
				case 'l': { this.img = self.images.diverleft; break; }
				case 'r': { this.img = self.images.diverright; break; }
				case 'u': { this.img = self.images.diverup; break; }
				default:
					break;
			}

		}

		this.newPosition = function()
		{
			switch (this.state) {
				case 'd': {
					if (this.position.y < 520) this.position.y += 1;
					if (this.position.y == 260) this.position.x += 1;
					if (this.position.y >= 310 && this.position.y <= 460) this.position.x -= 17/155;
					if (this.position.y > 460 && this.position.y < 520) this.position.x += 17/60;

					if (this.position.y == 520)
					{
						this.position.y += Math.round(Math.random() * 9) - 4
						this.changeDirection(Math.random() > .5 ? "l" : "r");
					}
//					if (this.position.y == 520) this.changeDirection("u");
					break;
				}

				case 'l': {
					if (this.position.x > 3)
					{
						this.position.x -= 1;
					}
					else
					{
						this.changeDirection('r');
					}
					break;
				}

				case 'r': {
					if (this.position.x < 630)
					{
						this.position.x += 1;
					}
					else
					{
						this.changeDirection('l');
					}
					break;
				}

				case 'u': {
					if (this.position.y == 520) this.position.x += 35;
					if (this.position.y > 100) this.position.y -= 1;
					if (this.position.y > 460 && this.position.y < 520) this.position.x -= 17/60;
					if (this.position.y >= 310 && this.position.y <= 460) this.position.x += 17/155;
					if (this.position.y == 260) this.position.x -= 1;
					break;
				}
			}
		}

		/**
		 * Дышать
		 */
		this.breathe = function()
		{
			if (this.state == "z")
			{
				this.oxygen += 3000;
			}
			else
			{
				// за себя
				this.oxygen -= (50 / 20);
				// и за каждую звезду
				for( var i in this.haveStar)
					this.oxygen -= (this.haveStar[i].value / 20);
			}
		}

		this.compensation = function()
		{

		}

		this.renderOxygen = function(ctx, x, y)
		{
			this.breathe();
			var value = this.oxygen / 20000;
			ctx.beginPath();
			ctx.fillStyle = "rgba(0, 63, 255, 1)";
			ctx.fillRect(x, y - 2, 52, 3);
			ctx.fillStyle = "rgba(255, 255, 255, 1)";
			if (value < .5) ctx.fillStyle = "rgba(255, 127, 127, 1)";
			if (value < .3) ctx.fillStyle = "rgba(255, 63, 63, 1)";
			if (value < .1) ctx.fillStyle = "rgba(255, 0, 0, 1)";
			ctx.fillRect(x + 1, y - 1, 50 * value, 1);
			ctx.stroke();
		}

		this.render = function (ctx)
		{
			this.newPosition();
			this.renderOxygen(ctx, this.position.x, this.position.y - 2, .5);

			ctx.drawImage(this.img, this.position.x, this.position.y);
		}

		this.pickupStar = function(){}
		this.trowStar = function(){}
	}

	this.fishXY = function(iterator, vx, vy, w, h)
	{
		return {
			x : Math.abs(iterator*vx % (w + 100) * 2 - (w + 100)) - 100,
			y : Math.abs(iterator*vy % (h - 320) * 2 - (h - 320)) + 200
		}
	}

	this.renderBackground = function(ctx, iterator)
	{
		var w = ctx.canvas.width;
		var h = ctx.canvas.height;

		ctx.clearRect(0, 0, w, h);

		var waveDelta = Math.abs(iterator/2 % 25);
		ctx.drawImage(this.images.wave1, waveDelta - 25, 66);
		ctx.drawImage(this.images.wave2, -waveDelta, 80);

		var cloudIterator = iterator + 1000;
		ctx.drawImage(this.images.cloudss, cloudIterator/1.6 % (w + 150) - 75, 0);
		ctx.drawImage(this.images.clouds, cloudIterator/1.4 % (w + 100) - 75, 5);
		ctx.drawImage(this.images.cloud, cloudIterator/1.3 % (w + 100) - 75, 8);
		ctx.drawImage(this.images.clouds, cloudIterator/1.2 % (w + 75) - 75, 15);
		ctx.drawImage(this.images.clouds8, cloudIterator % (w + 75) - 75, 25);
		ctx.drawImage(this.images.shipEmpty, 512, Math.abs(iterator/4 % 4 - 2));
		ctx.drawImage(this.images.wave3, waveDelta - 25, 94);

		// fp - Fish Position - Координаты рыбы
		var fp = this.fishXY(iterator + 300, .5, .3, w, h);
		ctx.drawImage(this.buffer['fish0'] > fp.x ? this.images.fishes75x50 : this.images.fishes75x50r, fp.x, fp.y);
		this.buffer['fish0'] = fp.x;

		fp = this.fishXY(iterator, 1.5, .5, w, h);
		ctx.drawImage(this.buffer['fish1'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish1'] = fp.x;

		fp = this.fishXY(iterator + 500, 1, .7, w, h);
		ctx.drawImage(this.buffer['fish2'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish2'] = fp.x;

		fp = this.fishXY(iterator + 100, 2, .2, w, h);
		ctx.drawImage(this.buffer['fish3'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish3'] = fp.x;

		fp = this.fishXY(iterator + 1000, .5, .3, w, h);
		ctx.drawImage(this.buffer['fish4'] > fp.x ? this.images.fishes75x100 : this.images.fishes75x100r, fp.x, fp.y);
		this.buffer['fish4'] = fp.x;

		fp = this.fishXY(iterator + 1500, .2, .1, w, h);
		ctx.drawImage(this.buffer['fish5'] > fp.x ? this.images.fishes2 : this.images.fishes2r, fp.x, fp.y);
		this.buffer['fish5'] = fp.x;

		ctx.drawImage(this.images.tros, 592, 64);


		for( var s in this.stars)
		{
			this.stars[s].render(ctx);
		}

		for( var d in this.divers)
		{
			this.divers[d].render(ctx);
		}
	}
}

