function diverGame()
{
	var self = this;
	this.date = new Date();
	this.fps = 20;
	this.ctx = null;
	this.rendered = true;
	this.iterator = 0;
	this.intervalId = 1;
	this.paused = true;
	this.compressorUser = null;
	
	this.init = function()
	{
		var backCanvas = document.getElementById("backCanvas");
		backCanvas.onmousedown = function(e){
			var base = document.getElementById("main");
			var x = (document.documentElement.scrollLeft || document.body.scrollLeft) + e.clientX - base.offsetLeft - this.offsetLeft;
			var y = (document.documentElement.scrollTop || document.body.scrollTop)  + e.clientY - base.offsetTop - this.offsetTop;
			if (y < 100 || y > 560) return;
			self.addStar(x > 33 ? (x > this.width - 23 ? x - 66 : x - 33) : x, y - 23);
		}
		this.ctx = backCanvas.getContext('2d');  // Контекст холста
		this.ctx.canvas.width = 720;
		this.ctx.canvas.height = 600;
		this.addDiver();
		this.play();
	}

	this.play = function()
	{
		this.date = new Date();
		if (!this.paused) return;
		this.paused = false;
		this.intervalId = setInterval(function(){
			self.renderGame(self.iterator++)
		}, 10);
	}

	this.pause = function()
	{
		clearInterval(this.intervalId);
		this.paused = true;
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

		thought: newImage('images/thought.png'),

		tros : newImage('images/tros.png')
	}

	this.foundStars = {};

	this.divers = {};
	this.stars = {};

	this.addDiver = function()
	{
		this.divers['Diver' + this.iterator] = new this.diver('Diver' + this.iterator);
	}

	this.deleteDiver = function()
	{
		for (var d in this.divers)
		{
			if (this.divers[d].state == 'zapravka')
			{
				if (this.compressorUser == this.divers[d].name) this.compressorUser = null;
				delete this.divers[d];
				break;
			}
		}
	}

	this.addStar = function(x, y)
	{
		var countStars = Object.keys(this.stars).length;
		if (countStars < 100)
			this.stars['Star' + this.iterator] = new this.star(x, y, 'Star' + this.iterator);
	}

	this.star = function(x, y, name){
		this.name = name;
		this.direction = 'd'; // d, w (wait)
		this.state = 'free';// free, owned, spotted
		this.position = {'x' : x, 'y' : y};
		this.value = Math.ceil(Math.random() * 10);
		this.img = self.images['star' + this.value];
		this.deep = 510 + Math.round(Math.random() * 20);

		this.newPosition = function()
		{
			if (this.position.y > this.deep) this.direction = 'w';
			this.position.y += 4*20/self.fps;
		}

		this.render = function (ctx)
		{
			if (this.direction == 'd') this.newPosition();
			ctx.drawImage(this.img,	Math.round(this.position.x), Math.round(this.position.y));
		}
	}

	this.diver = function(name){
		this.name = name;
		this.direction = "dr"; // d, u, l, r, z
		this.state = "dive" // dive, scan, ascent
		this.stops = {380:5, 240:10, 184:15};
		this.oxygen = 10000;
		this.haveStar = {};
		this.spottedStar = {name:'empty', value:0};
		this.smallestStar = {name:'empty', value:0};
		this.position = {x : 585, y : 80};
		this.purpose = {x : 586, y : 490};
		this.thoughtCloud = false;
		this.img = self.images.diverdown;

		this.changeDirection = function(direction)
		{
			switch (direction) {
				case 'dl': { this.img = self.images.diverdown; break; }
				case 'dr': { this.img = self.images.diverup; break; }
				case 'l': { this.img = self.images.diverleft; break; }
				case 'r': { this.img = self.images.diverright; break; }
				case 'ul': {this.img = self.images.diverdown; break;}
				case 'ur': {this.img = self.images.diverup;	break; }
				default:
					break;
			}
			this.direction = direction;
		}

		this.checkDirection = function (w,h)
		{
			if (['l','r'].indexOf(this.direction) != -1)
			{
				if (Math.round(this.position.y) != Math.round(this.purpose.y))
				{
					var delta = this.purpose.y - this.position.y;
					this.position.y += 4/self.fps*Math.abs(delta)/(delta);
				}
				if (Math.abs(this.purpose.x - this.position.x) > 30)
					this.changeDirection(this.purpose.x < Math.round(this.position.x) ? 'l' : 'r');
			}
		}

		this.newPosition = function(w,h)
		{
			switch (this.direction) {
				case 'dl': {}
				case 'dr': {
					if (this.position.y < 490) this.position.y += 1*20/self.fps;
					if (this.position.y == 260) this.position.x += 1*20/self.fps;
					if (this.position.y >= 310 && this.position.y <= 460) this.position.x -= 17/155*20/self.fps;
					if (this.position.y > 460 && this.position.y < 520) this.position.x += 17/30*20/self.fps;
					break;
				}
				case 'l': {
					if (this.position.x > -1 || this.spottedStar.name != 'empty') { this.position.x -= 1*20/self.fps; }
					else if (this.state == 'scan'){ this.newPurpose('scan', w - 65, 490) }
					break;
				}
				case 'r': {
					if (this.position.x < w - 64 || this.spottedStar.name != 'empty') { this.position.x += 1*20/self.fps; }
					else if (this.state == 'scan'){ this.newPurpose('scan', -1, 490) }
					break;
				}
				case 'ul': {}
				case 'ur': {
					if (this.stops[Math.round(this.position.y)] && this.stops[Math.round(this.position.y)] > 0) {
						this.stops[Math.round(this.position.y)] -= 1/self.fps;
						this.thoughtCloud = true;
						break;
					}
					this.thoughtCloud = false;
					if (this.position.y > 80) this.position.y -= 1*20/self.fps;
					if (this.position.y > 460 && this.position.y < 520) this.position.x -= 17/30*20/self.fps;
					if (this.position.y >= 310 && this.position.y <= 460) this.position.x += 17/155*20/self.fps;
					if (this.position.y == 260) this.position.x -= 1*20/self.fps;
					break;
				}
			}

			this.checkDirection(w,h);
		}

		this.newPurpose = function(state, x, y)
		{
			this.position.x = Math.round(this.position.x);
			this.position.y = Math.round(this.position.y);
			this.state = state;
			this.purpose.x = x;
			this.purpose.y = y;
			this.checkDirection();
		}

		this.checkPosition = function(w,h)
		{
			var delta = 80/self.fps;
			delta = delta < 2 ? 2 : (delta > 20 ? 20 : delta);
			if (
				Math.abs(this.purpose.x - this.position.x) > delta ||
				Math.abs(this.purpose.y - this.position.y) > delta) return;
			
			switch (this.state)
			{
				case 'dive': {
					this.changeDirection('l');
					Math.random() > .5 ? this.newPurpose('scan', w - 62, 490) : this.newPurpose('scan', -1, 490);
					break;
				}
				case 'scan': {
					if (this.spottedStar.name == 'empty') break;
					this.pickupStar()
					break;
				}
				case 'ascent': {
					if (Math.abs(this.position.y-80) > delta)
					{
						this.position.x = Math.abs(this.position.x - 620) < 2 ? 620 : 585;
						var dir = Math.abs(this.position.x - 620) < delta ? 'ur' : 'ul';
						this.newPurpose('ascent', dir=='ur'?620:585, 80)
						this.changeDirection(dir);
						this.compensation();
					}
					else
					{
						this.state = "zapravka";
					}
					break;
				}
			}
		}

		this.say = function(str)
		{
			if (document.getElementById('diverRadio').style.display && document.getElementById('diverRadio').style.display != 'none')
				document.getElementById('diverRadio').innerHTML = "<strong>" + this.name + "</strong>: " + str + "<br/>" + document.getElementById('diverRadio').innerHTML;
//			console.log(this.name + ": " + str);
		}

		this.breathe = function()
		{
			if (this.state == "zapravka")
			{
				if (Object.keys(this.haveStar).length != 0)
				{
					this.say("Принес звезды. Заправляю кислородные балоны.");
					for (var s in this.haveStar) self.foundStars[s] = this.haveStar[s];
					this.haveStar = {};
				}

				if (!self.compressorUser) {self.compressorUser = this.name; this.position.y -= 2; };
				if (self.compressorUser == this.name) this.oxygen += 3000/self.fps;
				if (this.oxygen > 20000)
				{
					self.compressorUser = null;
					this.say("Заправил кислородные балоны, спускаюсь на дно...");
					this.setSmallestStar();
					this.oxygen = 20000;
					this.changeDirection(this.direction == 'ul' ? 'dl': 'dr');
					this.newPurpose('dive', this.position.x + 1, 490);
				}
			}
			else
			{
				// за себя и за каждую звезду
				this.oxygen -= (50 / self.fps);
				for(var i in this.haveStar) this.oxygen -= (this.haveStar[i].value / self.fps);
				// хватает ли нам кислорода?
				// (20 + 50)*30 + 550 (и +500 по технике безопасности :))
				if (this.oxygen < 3500 && this.state != 'ascent')
				{
					this.say('Кончается кислород... Возвращаюсь на корабль');
					if (this.spottedStar.name != 'empty') self.stars[this.spottedStar.name].state = "free";
					this.newPurpose('ascent', Math.random()>.5?620:585, 490);
				}
			}

		}

		this.scan = function(w,h){
			for (var i in self.stars)
			{
				var star = self.stars[i];
				if (star.state == "free"
					&& star.direction == "w"
					&& this.spottedStar.value < star.value
					&& (this.smallestStar.name == 'empty' || (this.smallestStar.value < star.value || Object.keys(this.haveStar).length < 2))
					&& Math.abs(star.position.x - this.position.x) < w/3)
				{
					// Освобождаю звезду
					if (this.spottedStar.name != 'empty') self.stars[this.spottedStar.name].state = "free";
					// бросаю наименьшую
					if (this.smallestStar.name != 'empty' && Object.keys(this.haveStar).length == 2) this.trowStar();
					star.state = "spotted";
					this.spottedStar = star;
					this.newPurpose('scan', star.position.x, star.position.y - 20)
					star.owner = this.name;
					this.say("Плыву к звезде " + star.value);
				}
			}
		}

		this.compensation = function()
		{
			this.say("Заправляю компенсатор плавучести");
			for(var s in this.haveStar) this.oxygen -= this.haveStar[s].value * 50;
			this.oxygen -= 50;
		}

		this.renderOxygen = function(ctx, x, y)
		{
			ctx.beginPath();
			ctx.fillStyle = "rgb(0, 63, 255)";
			ctx.fillRect(Math.round(this.position.x), Math.round(this.position.y), 52, 3);
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(Math.round(this.position.x + 1), Math.round(this.position.y + 1), Math.round(50 * this.oxygen / 20000), 1);
			ctx.stroke();
		}

		this.renderStars = function(ctx)
		{
			var i = 1;
			for (var s in this.haveStar)
			{
				this.haveStar[s].position.y = Math.round(this.position.y + (i++ * 7)) + 10;
				this.haveStar[s].position.x = Math.round(this.position.x + (['l', 'ur'].indexOf(this.direction)==-1?-1:1) * (++i*5)) - 50;
				if (this.direction == 'r') this.haveStar[s].position.x += 100;
				if (this.direction == 'ul') { this.haveStar[s].position.x += 90; this.haveStar[s].position.y -= 25; }
				if (this.direction == 'ur') { this.haveStar[s].position.x -= 15; this.haveStar[s].position.y -= 25; }
				this.haveStar[s].render(ctx);
			}
		}

		this.render = function (ctx)
		{
			try{
				this.breathe();
				if( this.state == 'scan') this.scan(ctx.canvas.width, ctx.canvas.height);
				this.checkPosition(ctx.canvas.width, ctx.canvas.height);
				this.newPosition(ctx.canvas.width, ctx.canvas.height);

				this.renderOxygen(ctx, Math.round(this.position.x), Math.round(this.position.y) - 2, .5);
				ctx.drawImage(this.img, Math.round(this.position.x), Math.round(this.position.y) + 3);
				this.renderStars(ctx);

				if (this.thoughtCloud) ctx.drawImage(self.images.thought, Math.round(this.position.x)-100, Math.round(this.position.y) - 50);
//				ctx.drawImage(canvas, Math.round(this.position.x), Math.round(this.position.y));
			}catch(e){console.log(e)}
		}

		this.pickupStar = function(){
			this.say('Подобрал звезду ' + this.spottedStar.value);
			this.spottedStar.state = 'owned';
			this.haveStar[this.spottedStar.name] = this.spottedStar;
			this.setSmallestStar();
			delete self.stars[this.spottedStar.name];
			delete this.spottedStar;

			if (this.smallestStar.value == 10 && Object.keys(this.haveStar).length == 2)
			{
				this.say('Собрал хорошие звезды :) Возвращаюсь на корабль!');
				this.newPurpose('ascent', Math.random()>.5?620:585, 490);
			}else{this.newPurpose('scan', -1, 490)}
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
//			self.stars[this.smallestStar.name].position.x += Math.round(this.position.x);
			self.stars[this.smallestStar.name].position.y += - 4;
			self.stars[this.smallestStar.name].direction = "d";
			delete this.haveStar[this.smallestStar.name];
			this.setSmallestStar();
		}
		
		this.say("Готов к поискам звезд! =)))");
	}

	this.fishXY = function(iterator, vx, vy, w, h)
	{
		return {
			x : Math.round(Math.abs(iterator*vx % (w + 100) * 2 - (w + 100))) - 100,
			y : Math.round(Math.abs(iterator*vy % (h - 270) * 2 - (h - 270))) + 150
		}
	}

	this.renderBackground = function(iterator)
	{
		var w = this.ctx.canvas.width;
		var h = this.ctx.canvas.height;

		var waveDelta = Math.round(Math.abs(iterator/2 % 25));
		this.ctx.drawImage(this.images.wave1, waveDelta - 25, 66);
		this.ctx.drawImage(this.images.wave2, -waveDelta, 80);

		var cloudIterator = iterator + 1000;
		this.ctx.drawImage(this.images.cloudss, Math.round(cloudIterator/1.6 % (w + 150)) - 75, 0);
		this.ctx.drawImage(this.images.clouds, Math.round(cloudIterator/1.4 % (w + 100)) - 75, 5);
		this.ctx.drawImage(this.images.cloud, Math.round(cloudIterator/1.3 % (w + 100)) - 75, 8);
		this.ctx.drawImage(this.images.clouds, Math.round(cloudIterator/1.2 % (w + 75)) - 75, 15);
		this.ctx.drawImage(this.images.clouds8, Math.round(cloudIterator % (w + 75)) - 75, 25);

		var ts = 0;
		var values = [];
		for(var s in self.foundStars)
		{
			self.foundStars[s].position.x = 510 + self.foundStars[s].value * 12;
			self.foundStars[s].position.y = 30 + Math.round(Math.abs(iterator/5 % 4 - 2)) - (self.foundStars[s].value * 2) % 10;
			if (values.indexOf(self.foundStars[s].value) == -1)
			{
				self.foundStars[s].render(this.ctx);
				values.push(self.foundStars[s].value);
			}
		}

		this.ctx.drawImage(this.images.shipEmpty, 512, Math.round(Math.abs(iterator/5 % 4 - 2)));
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

		fp = this.fishXY(iterator + 1500, .5, .2, w, h);
		this.ctx.drawImage(this.buffer['fish5'] > fp.x ? this.images.fishes2 : this.images.fishes2r, fp.x, fp.y);
		this.buffer['fish5'] = fp.x;

		this.ctx.drawImage(this.images.tros, 592, 64);
	}

	this.renderGame = function(iterator)
	{
		if (!this.rendered) { return; }
		this.rendered = false;
		this.ctx.clearRect(0,0,720,600);
		this.ctx.save();
		
		this.renderBackground(iterator);
		

		for(var s in this.stars) this.stars[s].render(this.ctx);
		for(var d in this.divers) this.divers[d].render(this.ctx);
		
		this.ctx.restore();
		this.fps = Math.round(1000 / (new Date() - this.date));
		if (this.fps < 1) this.fps = 1;

		document.getElementById('fps').innerHTML = this.fps;
		this.date = new Date();
		this.rendered = true;
	}
	
	this.changeSize = function(w,h)
	{
		if (w < 720) w = 720;
		if (w > 1440) w = 1440;
		h = 600;
		var backCanvas = document.getElementById("backCanvas");
		var main = document.getElementById("main");
		backCanvas.style.width = w + 'px';
		main.style.width = (w + 40) + 'px';
		this.ctx.canvas.width = w;
		backCanvas.style.height = h + 'px';
		this.ctx.canvas.height = h;
	}

	this.getStatistic = function(eId)
	{
		var elem = document.getElementById(eId);
		var inWater = {};
		var found = {};

		elem.innerHTML = "<strong>В воде звезд: " + Object.keys(this.stars).length + "</strong><br/>";

		for (var s in this.stars){
			if (!inWater[this.stars[s].value]) inWater[this.stars[s].value] = 0;
			inWater[this.stars[s].value] += 1;
		}

		for(var i = 10; i >= 1; i--)
		{
			if (!inWater[i]) continue;
			elem.innerHTML += "Номиналом " + i + ": " + inWater[i] + "<br/>";
		}

		elem.innerHTML += "<br/><strong>Собрано звезд: " + Object.keys(this.foundStars).length + "</strong><br/>";
		for (var s in this.foundStars){
			if (!found[this.foundStars[s].value]) found[this.foundStars[s].value] = 0;
			found[this.foundStars[s].value] += 1;
		}
		for(var i = 10; i >= 1; i--)
		{
			if (!found[i]) continue;
			elem.innerHTML += "Номиналом " + i + ": " + found[i] + "<br/>";
		}
	}
	this.getDiverStatistic = function(diverName)
	{
		for (var d in this.divers)
		{
			if (this.divers[s].name == diverName)
			{
				var diver = this.divers[s];
			}
		}

		var str = ">>> Дайвер " + diverName + " несет звезды ";

		document.getElementById('diverRadio').innerHTML =
		elem.innerHTML = "<strong>В воде звезд: " + Object.keys(this.stars).length + "</strong><br/>";
	}
}

