/**
 * HTML5 canvas Game
 *
 * @author Eugene Smith <easmith@mail.ru>
 */


/**
 * Функция-конструктор объекта Игры
 */
function diverGame()
{
	var self = this;
	this.date = new Date();
	this.fps = 20;
	/**
	 * Контекст холста
	 */
	this.ctx = null;

	/**
	 * Флаг отрисовки
	 */
	this.rendered = true;

	/**
	 * Счетчик для отрисовки фона
	 */
	this.iterator = 0;

	/**
	 * Id интервала обновления
	 */
	this.intervalId = 1;

	/**
	 * Флаг паузы игры
	 */
	this.paused = true;

	/**
	 * пользователь компрессора
	 */
	this.compressorUser = null;

	/**
	 * Инизиализация игры
	 */
	this.init = function()
	{
		var backCanvas = document.getElementById("backCanvas");
		// Событие mousedown юзабильнее click
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

	/**
	 * Запуск игры
	 */
	this.play = function()
	{
		this.date = new Date();
		if (!this.paused) return;
		this.paused = false;
		this.intervalId = setInterval(function(){
			self.renderGame(self.iterator++)
		}, 10);
	}

	/**
	 * Остановка игры
	 */
	this.pause = function()
	{
		clearInterval(this.intervalId);
		this.paused = true;
	}

	/**
	 * Вспомогательная функция для загрузки изображений
	 *
	 * @param  String path Путь к изображению
	 */
	var newImage = function (path) {
		var image = new Image();
		image.src = path;
		return image;
	}

	/**
	 * Буфер игры, для запоминания позиций
	 */
	this.buffer = {}

	/**
	 * Библиотека изображений
	 */
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

	/**
	 * Собранные со дна звезды
	 */
	this.foundStars = {};

	/**
	 * Дайверы, находящиеся в игре
	 */
	this.divers = {};

	/**
	 * Звезды в воде
	 */
	this.stars = {};

	/**
	 * Добавление нового дайвера
	 */
	this.addDiver = function()
	{
		this.divers['Diver' + this.iterator] = new this.Diver('Diver' + this.iterator);
	}

	/**
	 * Удаление дайвера с поверхности
	 */
	this.deleteDiver = function()
	{
		this.pause();
		for (var d in this.divers)
		{
			if (this.divers[d].state == 'zapravka')
			{
				if (this.compressorUser == this.divers[d].name) this.compressorUser = null;
				this.divers[d].say("Ухожу на корабль");
				this.divers[d].direction = 'delete';
				break;
			}
		}
		this.play();
	}

	/**
	 * Добавление новой звезды в указанных координатах
	 *
	 * @param integer x
	 * @param integer y
	 */
	this.addStar = function(x, y)
	{
		var countStars = Object.keys(this.stars).length;
		if (countStars < 100)
			this.stars['Star' + this.iterator] = new this.Star(x, y, 'Star' + this.iterator);
	}

	/**
	 * Функция-конструктор объекта Звезда
	 *
	 * @param integer x
	 * @paran integer y
	 * @param String name Имя
	 */
	this.Star = function(x, y, name){
		this.name = name;
		this.direction = 'd'; // d, w (wait)
		this.state = 'free';// free, owned, spotted
		this.position = {'x' : x, 'y' : y};
		this.value = Math.ceil(Math.random() * 10);
		this.img = self.images['star' + this.value];
		this.deep = 510 + Math.round(Math.random() * 20);

		/**
		 * Новая позиция на холсте
		 */
		this.newPosition = function()
		{
			if (this.position.y > this.deep) this.direction = 'w';
			this.position.y += 4*20/self.fps;
		}

		/**
		 * Отрисовка звезды на холсте
		 *
		 * @param <type> ctx Контекст холста
		 */
		this.render = function (ctx)
		{
			if (this.direction == 'd') this.newPosition();
			ctx.drawImage(this.img,	Math.round(this.position.x), Math.round(this.position.y));
		}
	}

	/**
	 * Функция-конструктор объекта Дайвер
	 *
	 * @param String name Имя
	 */
	this.Diver = function(name)
	{
		this.name = name;
		this.direction = "dr"; // Направление и позиция движения dl, dr, ul, ur, l, r
		this.state = "dive" // Текущее состояние дайвера dive, scan, ascent, zapravka
		this.stops = {380:5, 240:10, 184:15}; // Информация об остановках
		this.oxygen = 20000; // Балоны c кислородом
		this.haveStar = {}; // Имеющиеся в руках звезды
		this.spottedStar = {name:'empty', value:0}; // Замеченная звезда
		this.smallestStar = {name:'empty', value:0}; // Наименьшая из звезд
		this.position = {x : 585, y : 50}; // Позиция дайвера
		this.purpose = {x : 586, y : 490}; // Цель движения дайвера
		this.thoughtCloud = false; // Облако раздумий :)
		this.img = self.images.diverdown; // Изображение дайвера

		/**
		 * Изменени направления движения дайвера и соответствующая смена изображения
		 *
		 * @param String direction Направление
		 */
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

		/**
		 * Проверка правильности движения Дайвера к цели
		 */
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

		/**
		 * Вычисление новой позиции дайвера
		 *
		 * @param Integer w Ширина холста
		 * @param Intager h Высота холста
		 */
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
					for (var s in this.stops)
					{
						if (Math.abs(this.position.y - parseInt(s)) < 2 && this.stops[s] > 0)
						{
							this.stops[s] -= 1/self.fps;
							this.thoughtCloud = true;
							break;
						}
						else
						{
							this.thoughtCloud = false;
						}
					}
					if (!this.thoughtCloud)
					{
						if (this.position.y > 80) this.position.y -= 1*20/self.fps;
						if (this.position.y > 460 && this.position.y < 520) this.position.x -= 17/30*20/self.fps;
						if (this.position.y >= 310 && this.position.y <= 460) this.position.x += 17/155*20/self.fps;
						if (this.position.y == 260) this.position.x -= 1*20/self.fps;
					}
					break;
				}
				case 'delete' :	{
					if (this.position.y < 50) delete self.divers[this.name];
					this.position.y -= 1*20/self.fps;
				}
			}

			this.checkDirection(w,h);
		}

		/**
		 * Установление новой цели движения
		 *
		 * @param String state состояние
		 * @param Integer x
		 * @param Integer y
		 */
		this.newPurpose = function(state, x, y)
		{
			this.position.x = Math.round(this.position.x);
			this.position.y = Math.round(this.position.y);
			this.state = state;
			this.purpose.x = x;
			this.purpose.y = y;
			this.checkDirection();
		}

		/**
		 * Проверка положение дайвера (Достиг ли он цели?)
		 * Учитывая fps Создаем погрешность вычисления
		 *
		 * @param Integer w Ширина холста
		 * @param Integer h Высота холста
		 */
		this.checkPosition = function(w,h)
		{
			var delta = 80/self.fps;
			delta = delta < 2 ? 2 : (delta > 20 ? 20 : delta);
			if (
				Math.abs(this.purpose.x - this.position.x) > delta ||
				Math.abs(this.purpose.y - this.position.y) > delta) return;

			// Корректировка позиции
			this.position.x = this.purpose.x
			this.position.y = this.purpose.y

			switch (this.state)
			{
				// Погружение
				case 'dive': {
					this.changeDirection('l');
					Math.random() > .5 ? this.newPurpose('scan', w - 62, 490) : this.newPurpose('scan', -1, 490);
					break;
				}
				// Сканирование (поиск звезд)
				case 'scan': {
					if (this.spottedStar.name == 'empty') break;
					this.pickupStar()
					break;
				}
				// Возвращение на корабль
				case 'ascent': {
					// Достигли ли корабля?
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

		/**
		 * Радиосвязь дайвера
		 *
		 * @param String str Слова дайвера
		 */
		this.say = function(str)
		{
			if (document.getElementById('diverRadio').style.display && document.getElementById('diverRadio').style.display != 'none')
				document.getElementById('diverRadio').innerHTML = "<strong>" + this.name + "</strong>: " + str + "<br/>" + document.getElementById('diverRadio').innerHTML;
		}

		/**
		 * Дыхание дайвера с учетом звезд
		 */
		this.breathe = function()
		{
			// Если у судна, то снимаем скафандр и ждем заправки
			if (this.state == "zapravka" && this.direction != 'delete')
			{
				if (Object.keys(this.haveStar).length != 0)
				{
					this.say("Принес звезды. Жду заправки балонов.");
					for (var s in this.haveStar) self.foundStars[s] = this.haveStar[s];
					this.haveStar = {};
				}

				if (!self.compressorUser) {self.compressorUser = this.name; this.position.y -= 3; };
				if (self.compressorUser == this.name) this.oxygen += 3000/self.fps;
				if (this.oxygen > 20000)
				{
					this.stops = {380:5, 240:10, 184:15};
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
				// (20 + 50) * 30 (от левого угла до троса и по тросу) + 1500(остановки) + 550 (компенсация) (и +500 по технике безопасности :))
				if (this.oxygen < 5000 && this.state != 'ascent')
				{
					this.say('Кончается кислород... Возвращаюсь на корабль');
					if (this.spottedStar.name != 'empty') self.stars[this.spottedStar.name].state = "free";
					this.newPurpose('ascent', Math.random()>.5?620:585, 490);
				}
			}

		}

		/**
		 * Сканирование толщи воды на наличие звезд
		 * Замечаем и плывем к наибольшей звезде
		 *
		 * @param Integer w Ширина холста
		 * @param Integer h Высота холста
		 */
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
					this.newPurpose('scan', star.position.x + (star.position.x<this.position.x?30:-30), star.position.y - 30)
					star.owner = this.name;
					this.say("Плыву к звезде " + star.value);
				}
			}
		}

		/**
		 * Компенсирую баласт для всплытия с учетом подобранных звезд
		 */
		this.compensation = function()
		{
			this.say("Заправляю компенсатор плавучести");
			for(var s in this.haveStar) this.oxygen -= this.haveStar[s].value * 50;
			this.oxygen -= 50;
		}

		/**
		 * Отрисовка количества дыхательной смеси
		 *
		 * @param <type> ctx Контекст холста
		 */
		this.renderOxygen = function(ctx)
		{
			ctx.beginPath();
			ctx.fillStyle = "rgb(0, 63, 255)";
			ctx.fillRect(Math.round(this.position.x), Math.round(this.position.y), 52, 3);
			ctx.fillStyle = "rgb(255, 255, 255)";
			ctx.fillRect(Math.round(this.position.x + 1), Math.round(this.position.y + 1), Math.round(50 * this.oxygen / 20000), 1);
			ctx.stroke();
		}

		/**
		 * Отрисовка имеющихся звезд
		 *
		 * @param <type> ctx Контекст холста
		 */
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

		/**
		 * Отрисовка дайвера, дыхательной смеси и звезд; смена положения
		 */
		this.render = function (ctx)
		{
			this.breathe();
			if( this.state == 'scan') this.scan(ctx.canvas.width, ctx.canvas.height);
			this.checkPosition(ctx.canvas.width, ctx.canvas.height);
			this.renderOxygen(ctx);
			ctx.drawImage(this.img, Math.round(this.position.x), Math.round(this.position.y) + 3);
			this.renderStars(ctx);
			if (this.thoughtCloud) ctx.drawImage(self.images.thought, Math.round(this.position.x)-100, Math.round(this.position.y) - 50);
			this.newPosition(ctx.canvas.width, ctx.canvas.height);
		}

		/**
		 * Подбор звезды
		 */
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
				// Случайным образом выбираю с какой стороны подплывать к тросу
				this.newPurpose('ascent', Math.random()>.5?620:585, 490);
			}else{this.newPurpose('scan', (this.direction=='l'?-1:self.ctx.canvas.width), 490)}
			this.spottedStar = {name:'empty', value:0};
		}

		/**
		 * Установка наименьшей звезды
		 */
		this.setSmallestStar = function()
		{
			this.smallestStar = {name:'empty', value:10};
			for(var hs in this.haveStar)
			{
				if (this.haveStar[hs].value < this.smallestStar.value) this.smallestStar = this.haveStar[hs];
			}
		}

		/**
		 * Сброс наименьшей звезды
		 */
		this.trowStar = function(){
			this.say("Бросаю звезду " + this.smallestStar.value);
			self.stars[this.smallestStar.name] = this.haveStar[this.smallestStar.name];
			self.stars[this.smallestStar.name].state = 'free';
			self.stars[this.smallestStar.name].position.x += (this.direction=='l'?15:35);
			self.stars[this.smallestStar.name].position.y += - 4;
			self.stars[this.smallestStar.name].direction = "d";
			delete this.haveStar[this.smallestStar.name];
			this.setSmallestStar();
		}

		// Речь при появлении
		this.say("Готов к поискам звезд! =)))");
	}

	/**
	 * Вспомогательная функция для отрисовки рыб движущихся с разной скоростью
	 *
	 * @param Intager iterator Текущая итерация игры
	 * @param float vx Скорость движения по x
	 * @param float vy Скорость движения по y
	 * @param Integer w Ширина холста
	 * @param Integer h Высота холста
	 */
	this.fishXY = function(iterator, vx, vy, w, h)
	{
		return {
			x : Math.round(Math.abs(iterator*vx % (w + 100) * 2 - (w + 100))) - 100,
			y : Math.round(Math.abs(iterator*vy % (h - 270) * 2 - (h - 270))) + 150
		}
	}

	/**
	 * Отрисовка фона с рыбками, волнами, облаками
	 */
	this.renderBackground = function(iterator)
	{
		var w = this.ctx.canvas.width;
		var h = this.ctx.canvas.height;

		// Первые две волны
		var waveDelta = Math.round(Math.abs(iterator/2 % 25));
		this.ctx.drawImage(this.images.wave1, waveDelta - 30, 66);
		this.ctx.drawImage(this.images.wave2, -waveDelta, 80);

		// Облака
		var cloudIterator = iterator + 1000;
		this.ctx.drawImage(this.images.cloudss, Math.round(cloudIterator/1.6 % (w + 150)) - 75, 0);
		this.ctx.drawImage(this.images.clouds, Math.round(cloudIterator/1.4 % (w + 100)) - 75, 5);
		this.ctx.drawImage(this.images.cloud, Math.round(cloudIterator/1.3 % (w + 100)) - 75, 8);
		this.ctx.drawImage(this.images.clouds, Math.round(cloudIterator/1.2 % (w + 75)) - 75, 15);
		this.ctx.drawImage(this.images.clouds8, Math.round(cloudIterator % (w + 75)) - 75, 25);

		// Рисуем звезды на корабле
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

		// Корабль и третья волна
		this.ctx.drawImage(this.images.shipEmpty, 512, Math.round(Math.abs(iterator/5 % 4 - 2)));
		this.ctx.drawImage(this.images.wave3, waveDelta - 25, 94);

		// А теперь группы рыб
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

		// Трос ближе всех
		this.ctx.drawImage(this.images.tros, 592, 64);
	}

	/**
	 * Отрисовка всех элементов игры
	 */
	this.renderGame = function(iterator)
	{
		if (!this.rendered) { return; }
		this.rendered = false;
		this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
		this.ctx.save();
		// фон
		this.renderBackground(iterator);
		// Звезды
		for(var s in this.stars) this.stars[s].render(this.ctx);
		// Дайверы
		for(var d in this.divers) this.divers[d].render(this.ctx);
		
		this.ctx.restore();
		
		this.fps = Math.round(1000 / (new Date() - this.date));
		if (this.fps < 1) this.fps = 1;
		// Пишем FPS
		document.getElementById('fps').innerHTML = this.fps;
		// Каждые 1000 итераций чищу лог радиосвязи
		if (iterator % 1000 == 0) document.getElementById('diverRadio').innerHTML.substr(0, 1000);

		this.date = new Date();
		this.rendered = true;
	}

	/**
	 * Изменение размеров Холста
	 */
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

	/**
	 * Сбор статистики
	 *
	 * @param <type> eId HTML элемент, куда все писать
	 */
	this.getStatistic = function(eId)
	{
		var elem = document.getElementById(eId);
		var inWater = {};
		var found = {};
		var pd = {}; // per Diver

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
			if (!pd[this.foundStars[s].owner]) pd[this.foundStars[s].owner] = 0;
			if (!found[this.foundStars[s].value]) found[this.foundStars[s].value] = 0;
			found[this.foundStars[s].value] += 1;
			pd[this.foundStars[s].owner] += 1;
		}
		for(var i = 10; i >= 1; i--)
		{
			if (!found[i]) continue;
			elem.innerHTML += "Номиналом " + i + ": " + found[i] + "<br/>";
		}

		elem.innerHTML += "<br/><strong>Лучшие дайверы:</strong><br/>";
		for(var d in pd)
		{
			elem.innerHTML += "<strong>" + d + ":</strong> "+ pd[d] + "<br/>";
		}
	}
}

var dg = new diverGame();
window.onload = function()
{
	dg.init();
	document.getElementById("loading").style.display = "none";
	document.getElementById("addDiver").onclick = function(e){dg.addDiver(); return false;};
	document.getElementById("deleteDiver").onclick = function(e){dg.deleteDiver(); return false;};

	// Все что ниже - дополнительная информация к игре
	document.getElementById("pause").onclick = function(e){dg.pause()};
	document.getElementById("play").onclick = function(e){dg.play()};
	document.getElementById("diverRadioHeader").onclick = function(e){
		if (document.getElementById("diverRadio").style.display && document.getElementById("diverRadio").style.display != 'none'){
			document.getElementById("diverRadio").style.display = 'none';
			document.getElementById("diverRadio").innerHTML = "Начинаем слушать радиосвязь =)";
		}
		else{
			document.getElementById("diverRadio").style.display = 'block';
		}
	};

	document.getElementById("statisticHeader").onclick = function(e){ dg.getStatistic('statistic');	};
}
// Перед обновлением окна или перед его закрытием, останавливаем игру
window.onbeforeunload  = function () {dg.pause()}