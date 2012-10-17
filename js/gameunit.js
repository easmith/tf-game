function backgroundUnit()
{
	var self = this;
	this.ctx = null;
	this.rendered = true;
	this.iterator = 0;
	
	this.init = function()
	{
		var backCanvas = document.getElementById("backCanvas");
		this.ctx = backCanvas.getContext('2d');  // Контекст холста
		this.ctx.canvas.width = 716;
		this.ctx.canvas.height = 597;
		var self = this;
		setInterval(function(){
			self.renderGame(self.iterator++)
		}, 25);
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

	this.foundStars = {};

	this.divers = {};
	this.stars = {};

	this.addDiver = function()
	{
		this.divers['diver' + this.iterator] = new this.diver('diver' + this.iterator);
	}

	this.addStar = function(x, y)
	{
		var countStars = Object.keys(this.stars).length;
		if (countStars < 50)
			this.stars['star' + this.iterator] = new this.star(x, y, 'star' + this.iterator);
	}

	this.star = function(x, y, name){
		this.name = name;
		this.direction = 'd'; // d, w (wait)
		this.state = 'free';// free, owned, spotted
		this.position = {'x' : x, 'y' : y};
		this.value = Math.round(Math.random() * 10);
		this.img = self.images['star' + this.value];

		this.newPosition = function()
		{
			switch (this.direction) {
				case 'd': {
					if (this.position.y > 515) { this.direction = 'w'; this.position.y += Math.round(Math.random() * 10); }
					this.position.y += 4;
				}
			}
		}

		this.render = function (ctx)
		{
			try {
				if (typeof( this.position) != 'object') return;
				this.newPosition();
				ctx.drawImage(this.img,	this.position.x, this.position.y);
			}catch(e){}
		}
	}

	this.diver = function(name){
		this.name = name;
		this.direction = "d"; // d, u, l, r, z
		this.state = "dive" // dive, scan, ascent
		this.stops = {400:5, 280:10, 184:15};
		this.oxygen = 20000;
		this.haveStar = {};
		this.spottedStar = {name:'empty', value:0};
		this.smallestStar = {name:'empty', value:0};
		this.position = {x : 585, y : 80};
		this.purpose = {x : 586, y : 520};
		this.img = self.images.diverdown;

		this.changeDirection = function(direction)
		{
			switch (direction) {
				case 'd': { if (this.direction != "z") this.img = self.images.diverdown; break; }
				case 'l': { this.img = self.images.diverleft; break; }
				case 'r': { this.img = self.images.diverright; break; }
				case 'u': { this.img = self.images.diverup; break; }
				default:
					break;
			}
			this.direction = direction;
		}

		this.newPosition = function()
		{
			switch (this.direction) {
				case 'd': {
					if (this.position.y < 520) this.position.y += 1;
					if (this.position.y == 260) this.position.x += 1;
					if (this.position.y >= 310 && this.position.y <= 460) this.position.x -= 17/155;
					if (this.position.y > 460 && this.position.y < 520) this.position.x += 17/60;
					break;
				}

				case 'l': {
					if (this.position.x > 3)
					{
						if (this.position.y != this.purpose.y)
						{
							var delta = this.purpose.y - this.position.y;
							this.position.y += Math.abs(delta)/(delta);
						}
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
						if (this.position.y != this.purpose.y)
						{
							var delta = this.purpose.y - this.position.y;
							this.position.y += Math.abs(delta)/(delta);
						}
						this.position.x += 1;
					}
					else
					{
						this.changeDirection('l');
					}
					break;
				}

				case 'u': {
					// остановки чтобы передохнуть =)
//					if (this.stops[this.position.y] && this.stops[this.position.y] > 0) {
//						this.stops[this.position.y] -= .05;
//						break;
//					}
					if (this.position.y == 520) this.position.x += 35;
					if (this.position.y > 80) this.position.y -= 1;
					if (this.position.y > 460 && this.position.y < 520) this.position.x -= 17/60;
					if (this.position.y >= 310 && this.position.y <= 460) this.position.x += 17/155;
					if (this.position.y == 260) this.position.x -= 1;
					break;
				}
			}
		}

		this.newPurpose = function(state, x, y)
		{
			this.state = state;
			this.purpose.x = x;
			this.purpose.y = y;
			if(this.direction == "l" || this.direction == "r")
			{
				this.changeDirection(this.purpose.x < this.position.x ? 'l' : 'r');
			}

		}

		this.checkPosition = function()
		{
			if (Math.round(this.purpose.x) != Math.round(this.position.x) || Math.round(this.purpose.y) != Math.round(this.position.y)) return;
			
			switch (this.state)
			{
				case 'dive': {
					this.state = 'scan';
					this.changeDirection(Math.random() > .5 ? "l" : "r");
					break;
				}
				case 'scan': {
					if (this.spottedStar.name == 'empty') break;
					this.pickupStar()
					break;
				}
				case 'ascent': {
					this.newPurpose('ascent', 620, 80)
					if (Math.round(this.position.y) != 80)
					{
						this.compensation();
					}
					this.changeDirection('u');
					if (Math.round(this.position.y) == 80)
					{
						this.changeDirection('z');
					}
					break;
				}
			}
		}

		this.say = function(str)
		{
			console.log(this.name + ": " + str);
		}

		this.breathe = function()
		{
			if (this.direction == "z")
			{
				this.oxygen += 3000/50;
				if (this.oxygen > 20000)
				{
					for (var s in this.haveStar)
					{
						self.foundStars[s] = this.haveStar[s];
					}
					this.haveStar = {};
					this.setSmallestStar();
					this.oxygen = 20000;
					this.changeDirection('d');
					this.newPurpose('dive', this.position.x + 1, 520);
				}
			}
			else
			{
				// за себя
				this.oxygen -= (50 / 20);
				// и за каждую звезду
				for( var i in this.haveStar)
					this.oxygen -= (this.haveStar[i].value / 20);
			}
			// хватает ли нам кислорода?
			if (this.oxygen < 15000 && this.state != 'ascent')
			{
				this.say('Кончается кислород... Возвращаюсь на корабль');
				this.newPurpose('ascent', 586, Math.round(this.position.y));
			}
		}

		this.scan = function(){
			for (var i in self.stars)
			{
				var star = self.stars[i];
				if (star.state == "free"
					&& star.direction == "w"
					&& this.spottedStar.value < star.value
					&& (this.smallestStar.name == 'empty' || (this.smallestStar.value < star.value || Object.keys(this.haveStar).length < 2))
					&& Math.abs(star.position.x - this.position.x) < 260)
				{
					// Освобождаю звезду
					if (this.spottedStar.name != 'empty') self.stars[this.spottedStar.name].state = "free";
					// бросаю наименьшую
					if (this.smallestStar.name != 'empty' && Object.keys(this.haveStar).length == 2) this.trowStar();
					star.state = "spotted";
					this.spottedStar = star;
					this.newPurpose('scan', star.position.x, star.position.y)
					star.owner = this.name;
					this.say("Плыву к звезде " + star.value);
				}
			}
		}

		this.compensation = function()
		{
			this.say("Компенсирую кислород");
		}

		this.renderOxygen = function(ctx, x, y)
		{
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

		this.renderStars = function()
		{
			var i = 0;
			for (var s in this.haveStar)
			{
				this.haveStar[s].position.y = this.position.y + (++i * 5);
				this.haveStar[s].position.x = this.position.x + (++i * 5);
				this.haveStar[s].render(self.ctx);
			}
		}

		this.render = function (ctx)
		{
			this.breathe();
			if( this.state == 'scan') this.scan();
			this.checkPosition();
			this.newPosition();
			this.renderOxygen(ctx, this.position.x, this.position.y - 2, .5);
			ctx.drawImage(this.img, this.position.x, this.position.y);
			this.renderStars();
		}

		this.pickupStar = function(){
			this.say('Подобрал звезду ' + this.spottedStar.value);
			this.haveStar[this.spottedStar.name] = this.spottedStar;
			this.setSmallestStar();
			delete self.stars[this.spottedStar.name];
			delete this.spottedStar;

			if (this.smallestStar.value == 10 && Object.keys(this.haveStar).length == 2)
			{
				this.say('Собрал хорошие звезды :) Возвращаюсь на корабль!');
				this.newPurpose('ascent', 586, Math.round(this.position.y));
			}

			this.spottedStar = {name:'empty', value:0};
		}

		this.setSmallestStar = function()
		{
			this.smallestStar = {name:'empty', value:10};
			for(var hs in this.haveStar)
			{
				if (this.haveStar[hs].value < this.smallestStar.value) this.smallestStar = this.haveStar[hs];
			}
		}

		this.trowStar = function(){
			this.say("Бросаю звезду " + this.smallestStar.value);
			self.stars[this.smallestStar.name] = this.haveStar[this.smallestStar.name];
			self.stars[this.smallestStar.name].state = 'free';
			self.stars[this.smallestStar.name].position.y -= 50;
			self.stars[this.smallestStar.name].direction = "d";
			delete this.haveStar[this.smallestStar.name];
			this.setSmallestStar();
		}
	}

	this.fishXY = function(iterator, vx, vy, w, h)
	{
		return {
			x : Math.abs(iterator*vx % (w + 100) * 2 - (w + 100)) - 100,
			y : Math.abs(iterator*vy % (h - 320) * 2 - (h - 320)) + 200
		}
	}

	this.renderBackground = function(iterator)
	{
		var w = this.ctx.canvas.width;
		var h = this.ctx.canvas.height;

		var waveDelta = Math.abs(iterator/2 % 25);
		this.ctx.drawImage(this.images.wave1, waveDelta - 25, 66);
		this.ctx.drawImage(this.images.wave2, -waveDelta, 80);

		var cloudIterator = iterator + 1000;
		this.ctx.drawImage(this.images.cloudss, cloudIterator/1.6 % (w + 150) - 75, 0);
		this.ctx.drawImage(this.images.clouds, cloudIterator/1.4 % (w + 100) - 75, 5);
		this.ctx.drawImage(this.images.cloud, cloudIterator/1.3 % (w + 100) - 75, 8);
		this.ctx.drawImage(this.images.clouds, cloudIterator/1.2 % (w + 75) - 75, 15);
		this.ctx.drawImage(this.images.clouds8, cloudIterator % (w + 75) - 75, 25);

		var ts = 0;
		var values = [];
		for(var s in self.foundStars)
		{
			self.foundStars[s].position.x = 510 + self.foundStars[s].value * 12;
			self.foundStars[s].position.y = 30 + Math.abs(iterator/4 % 4 - 2) - (self.foundStars[s].value * 2) % 10 + Math.random() * 2;
			if (values.indexOf(self.foundStars[s].value) == -1)
			{
				self.foundStars[s].render(this.ctx);
				values.push(self.foundStars[s].value);
			}
		}

		this.ctx.drawImage(this.images.shipEmpty, 512, Math.abs(iterator/4 % 4 - 2));
		this.ctx.drawImage(this.images.wave3, waveDelta - 25, 94);

		// fp - Fish Position - Координаты рыбы
		var fp = this.fishXY(iterator + 300, .5, .3, w, h);
		this.ctx.drawImage(this.buffer['fish0'] > fp.x ? this.images.fishes75x50 : this.images.fishes75x50r, fp.x, fp.y);
		this.buffer['fish0'] = fp.x;

		fp = this.fishXY(iterator, 1.5, .5, w, h);
		this.ctx.drawImage(this.buffer['fish1'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish1'] = fp.x;

		fp = this.fishXY(iterator + 500, 1, .7, w, h);
		this.ctx.drawImage(this.buffer['fish2'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish2'] = fp.x;

		fp = this.fishXY(iterator + 100, 2, .2, w, h);
		this.ctx.drawImage(this.buffer['fish3'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish3'] = fp.x;

		fp = this.fishXY(iterator + 1000, .5, .3, w, h);
		this.ctx.drawImage(this.buffer['fish4'] > fp.x ? this.images.fishes75x100 : this.images.fishes75x100r, fp.x, fp.y);
		this.buffer['fish4'] = fp.x;

		fp = this.fishXY(iterator + 1500, .2, .1, w, h);
		this.ctx.drawImage(this.buffer['fish5'] > fp.x ? this.images.fishes2 : this.images.fishes2r, fp.x, fp.y);
		this.buffer['fish5'] = fp.x;

		this.ctx.drawImage(this.images.tros, 592, 64);
	}

	this.renderGame = function(iterator)
	{
		if (!this.rendered) return;
		this.rendered = false;

		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.save();
		
		this.renderBackground(iterator);

		for( var s in this.stars)
		{
			this.stars[s].render(this.ctx);
		}

		for( var d in this.divers)
		{
			this.divers[d].render(this.ctx);
		}
		this.ctx.restore();
		this.rendered = true;
	}
}

