/**
 * HTML5 canvas Game
 *
 * @author Eugene Smith <easmith@mail.ru>
 */


/**
 * Функция-конструктор объекта Звезда
 *
 * @param integer x
 * @paran integer y
 * @param DiverGame game Игра
 */
var Star = function(x, y, game){
	this.game = game;
	this.name = "Star" + game.iterator;
	this.direction = 'd'; //  d, w (wait)
	this.state = 'free';// free, owned, spotted
	this.position = {'x' : x, 'y' : y};
	this.value = Math.ceil(Math.random() * 10); // величина
	this.img = game.images['star' + this.value]; // изображение, соответствующее величине
	this.deep = 520 + Math.round(Math.random() * 20); // глубина погружения
}
Star.prototype = {
	/**
	 * Новая позиция на холсте
	 */
	newPosition : function()
	{
		if (this.position.y > this.deep) { this.direction = 'w'; this.position.y = this.deep }
		this.position.y += this.game.config.starSpeed/this.game.fps;
	},

	/**
	 * Отрисовка звезды на холсте
	 */
	render : function ()
	{
		if (this.direction == 'd') this.newPosition();
		this.game.ctx.drawImageR(this.img, this.position.x, this.position.y);
	}
}

/**
 * Функция-конструктор объекта Дайвер
 *
 * @param DiverGame game Игра
 */
var Diver = function(game)
{
	this.game = game;
	this.name = 'Diver' + game.iterator;
	this.direction = Math.random()>.5?'dr':'dl'; // Направление и позиция движения dl, dr, ul, ur, l, r
	this.state = "dive" // Текущее состояние дайвера dive, scan, ascent, zapravka
	this.stops = {380:5, 240:10, 184:15}; // Информация об остановках
	this.oxygen = 20000; // Баллоны c кислородом
	this.haveStar = {}; // Имеющиеся в руках звезды
	this.spottedStar = {name:'empty', value:0}; // Замеченная звезда
	this.smallestStar = {name:'empty', value:0}; // Наименьшая из звезд
	this.position = {x : (this.direction=='dr'?585:620), y : 50}; // Позиция дайвера
	this.purpose = {x : (this.direction=='dr'?585:620), y : 480}; // Цель движения дайвера
	this.thoughtCloud = false; // Облако раздумий :)
	this.img = (this.direction=='dr'?game.images.diverdown:game.images.diverup); // Изображение дайвера
	this.minStar = Math.ceil(Math.random() * 10);
	// Речь при появлении
	this.say("Готов к поискам звезд! =)))");
}
Diver.prototype = {
	/**
	 * Изменение направления движения дайвера и соответствующая смена изображения
	 *
	 * @param String direction Направление
	 */
	changeDirection : function(direction)
	{
		switch (direction) {
			case 'dl':{this.img = this.game.images.diverdown; break;}
			case 'dr':{this.img = this.game.images.diverup; break;}
			case 'l':{this.img = this.game.images.diverleft; break;}
			case 'r':{this.img = this.game.images.diverright; break;}
			case 'ul':{this.img = this.game.images.diverdown; break;}
			case 'ur':{this.img = this.game.images.diverup; break;}
			default:break;
		}
		this.direction = direction;
	},

	/**
	 * Проверка правильности движения Дайвера к цели
	 */
	checkDirection : function (w,h)
	{
		if (['l','r'].indexOf(this.direction) != -1)
		{
			// Выравниваемся на уровень цели
			if (Math.round(this.position.y) != Math.round(this.purpose.y))
			{
				var delta = this.purpose.y - this.position.y;
				this.position.y += 20/this.game.fps*Math.abs(delta)/(delta);
			}
			if (Math.abs(this.purpose.x - this.position.x) > 10)
				this.changeDirection(this.purpose.x < Math.round(this.position.x) ? 'l' : 'r');
		}
	},

	/**
	 * Вычисление новой позиции дайвера
	 *
	 * @param Integer w Ширина холста
	 * @param Integer h Высота холста
	 */
	newPosition : function(w,h)
	{
		switch (this.direction) {
			case 'dl': {}
			case 'dr': {
				// огибаем трос
				if (this.position.y < 480) this.position.y += this.game.config.diverSpeed/this.game.fps;
				if (this.position.y == 260) this.position.x += this.game.config.diverSpeed/this.game.fps;
				if (this.position.y >= 310 && this.position.y <= 460) this.position.x -= 17/155*this.game.config.diverSpeed/this.game.fps;
				if (this.position.y > 460 && this.position.y < 520) this.position.x += 17/20*this.game.config.diverSpeed/this.game.fps;
				if (this.position.x > w || this.position.x < -1) this.changeDirection('l');
				break;
			}
			case 'l': {
				// плаваем от края до края
				if (this.position.x > -1 || this.spottedStar.name != 'empty') { this.position.x -= this.game.config.diverSpeed/this.game.fps; }
				else if (this.state == 'scan'){ this.newPurpose('scan', w - 62, 480) }
				break;
			}
			case 'r': {
				if (this.position.x < w - 64 || this.spottedStar.name != 'empty') { this.position.x += this.game.config.diverSpeed/this.game.fps; }
				else if (this.state == 'scan'){ this.newPurpose('scan', -1, 480) }
				break;
			}
			case 'ul': {}
			case 'ur': {
				// не двигаемся, если заправляемся или в очереди
				if (this.state == 'zapravka') break;
				this.thoughtCloud = false;
				for (var s in this.stops)
				{
					if (Math.abs(this.position.y - parseInt(s)) < 2 && this.stops[s] > 0)
					{
						this.stops[s] -= 1/this.game.fps;
						this.thoughtCloud = true;
						break;
					}
				}
				// не двигаемся, если отдыхаем
				if (this.thoughtCloud) break;
				// огибаем трос
				if (this.position.y <= 30) delete this.game.divers[this.name];
				if (this.position.y > 0) this.position.y -= this.game.config.diverSpeed/this.game.fps;
				if (this.position.y > 460 && this.position.y < 520) this.position.x -= 17/20*this.game.config.diverSpeed/this.game.fps;
				if (this.position.y >= 310 && this.position.y <= 460) this.position.x += 17/155*this.game.config.diverSpeed/this.game.fps;
				if (this.position.y == 260) this.position.x -= this.game.config.diverSpeed/this.game.fps;
				break;
			}
		}

		this.checkDirection(w,h);
	},

	/**
	 * Установление новой цели движения
	 *
	 * @param String state состояние
	 * @param Integer x
	 * @param Integer y
	 */
	newPurpose : function(state, x, y)
	{
		this.position.x = Math.round(this.position.x);
		this.position.y = Math.round(this.position.y);
		this.state = state;
		this.purpose.x = x;
		this.purpose.y = y;
		this.checkDirection();
	},

	/**
	 * Проверка положение дайвера (Достиг ли он цели?)
	 * Учитывая fps Создаем погрешность вычисления delta
	 *
	 * @param Integer w Ширина холста
	 * @param Integer h Высота холста
	 */
	checkPosition : function(w,h)
	{
		var delta = 80/this.game.fps;
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
				// случайным образом определяем в какую сторону плыть
				Math.random() > .5 ? this.newPurpose('scan', w - 62, 480) : this.newPurpose('scan', -1, 480);
				break;
			}
			// Сканирование (поиск звезд)
			case 'scan': {
				if (this.spottedStar.name == 'empty') break;
				// достигнув звезды подбираем ее
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
					this.purpose.y = 480;
					this.state = "zapravka";
					if (Object.keys(this.haveStar).length != 0)
					{
						this.say("Принес звезды. Жду заправки баллонов.");
						// выгружаем звезды
						for (var s in this.haveStar) this.game.foundStars[s] = this.haveStar[s];
						this.haveStar = {};
					}
				}
				break;
			}
		}
	},

	/**
	 * Радиосвязь дайвера
	 *
	 * @param String str Слова дайвера
	 */
	say : function(str)
	{
		if (ge('diverRadio').style.display && ge('diverRadio').style.display != 'none')
			ge('diverRadio').innerHTML = "<strong>" + this.name + "</strong>: " + str + "<br/>" + ge('diverRadio').innerHTML;
	},

	/**
	 * Дыхание дайвера с учетом звезд
	 */
	breathe : function()
	{
		// Если у судна, то снимаем скафандр и ждем заправки
		if (this.state == "zapravka")
		{
			if (!this.game.compressorUser) {this.game.compressorUser = this.name; this.position.y -= 3; };
			if (this.game.compressorUser == this.name) this.oxygen += 3000/this.game.fps;
			if (this.oxygen > 20000)
			{
				this.stops = {380:5, 240:10, 184:15};
				this.game.compressorUser = null;
				this.say("Заправил кислородные баллоны, спускаюсь на дно...");
				this.setSmallestStar();
				this.oxygen = 20000;
				this.changeDirection(this.direction == 'ul' ? 'dl': 'dr');
				this.newPurpose('dive', this.position.x + 1, 480);
			}
		}
		else
		{
			// за себя и за каждую звезду
			this.oxygen -= (50 / this.game.fps);
			for(var i in this.haveStar) this.oxygen -= (this.haveStar[i].value/this.game.fps);
			// хватает ли нам кислорода?
			// (20 + 50) * 30 (от левого угла до троса и по тросу с двумя 10) + 2100(остановки) + 1050 (компенсация с двумя десятками) (и +300 по технике безопасности :))
			if (this.oxygen < 5550 && this.state != 'ascent')
			{
				this.say('Кончается кислород... Возвращаюсь на корабль');
				if (this.spottedStar.name != 'empty') this.game.stars[this.spottedStar.name].state = "free";
				this.newPurpose('ascent', Math.random()>.5?620:585, 480);
			}
		}
	},

	/**
	 * Сканирование толщи воды на наличие звезд
	 * Замечаем и плывем к наибольшей звезде
	 *
	 * @param Integer w Ширина холста
	 * @param Integer h Высота холста
	 */
	scan : function(w,h){
		for (var i in this.game.stars)
		{
			var star = this.game.stars[i];
			if (star.state == "free"
				&& star.direction == "w"
				&& this.spottedStar.value < star.value
				&& (this.smallestStar.name == 'empty' || (this.smallestStar.value < star.value || Object.keys(this.haveStar).length < 2))
				&& Math.abs(star.position.x - this.position.x) < w/3)
			{
				// Освобождаю звезду
				if (this.spottedStar.name != 'empty') this.spottedStar.state = "free";
				// бросаю наименьшую
				if (this.smallestStar.name != 'empty' && Object.keys(this.haveStar).length == 2) this.trowStar();
				star.state = "spotted";
				this.spottedStar = star;
				// определяю позицию захвата звезды
				var deltaStar = Object.keys(this.haveStar).length * 2;
				var dx = star.position.x - this.position.x;
				var dy = star.position.y - this.position.y;
				var dir = dx < 0 ? (Math.abs(dx)>Math.abs(dy)?'r':'l'):(Math.abs(dx)>Math.abs(dy)?'l':'r');
				this.newPurpose('scan', star.position.x + this.game.config.hsp[dir][deltaStar], star.position.y - this.game.config.hsp[dir][deltaStar +1])
				star.owner = this.name;
				this.say("Плыву к звезде " + star.value);
			}
		}
	},

	/**
	 * Компенсирую баласт для всплытия с учетом подобранных звезд
	 */
	compensation : function()
	{
		this.say("Заправляю компенсатор плавучести");
		for(var s in this.haveStar) this.oxygen -= this.haveStar[s].value * 50;
		this.oxygen -= 50;
	},

	/**
	 * Отрисовка количества дыхательной смеси
	 *
	 * @param <type> ctx Контекст холста
	 */
	renderOxygen : function(ctx)
	{
		ctx.beginPath();
		ctx.fillStyle = "rgb(0, 63, 255)";
		ctx.fillRect(Math.round(this.position.x), Math.round(this.position.y), 52, 3);
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.fillRect(Math.round(this.position.x + 1), Math.round(this.position.y + 1), Math.round(50 * this.oxygen / 20000), 1);
		ctx.stroke();
	},

	/**
	 * Отрисовка имеющихся звезд
	 *
	 * @param <type> ctx Контекст холста
	 */
	renderStars : function(ctx)
	{
		var i = 0;
		for (var s in this.haveStar)
		{
			this.haveStar[s].position.x = Math.round(this.position.x+this.game.config.hsp[this.direction][i++]);
			this.haveStar[s].position.y = Math.round(this.position.y+this.game.config.hsp[this.direction][i++]);
			this.haveStar[s].render();
		}
	},

	/**
	 * Отрисовка дайвера, дыхательной смеси и звезд; смена положения
	 */
	render : function ()
	{
		var ctx = this.game.ctx;
		var w = ctx.canvas.width;
		var h = ctx.canvas.height;
		this.breathe(); // вздыхаем
		if( this.state == 'scan') this.scan(w, h); // ищем звезду
		this.checkPosition(w, h); // проверяем положение
		this.renderOxygen(ctx);
		ctx.drawImageR(this.img, this.position.x, this.position.y+3);
		this.renderStars(ctx); // рисуем подобранные звезды
		if (this.thoughtCloud) ctx.drawImageR(this.game.images.thought, this.position.x-100, this.position.y-50);
		this.newPosition(w, h); // смещаемся
	},

	/**
	 * Подбор звезды
	 */
	pickupStar : function(){
		this.say('Подобрал звезду ' + this.spottedStar.value);
		this.spottedStar.state = 'owned';
		this.haveStar[this.spottedStar.name] = this.spottedStar;
		this.setSmallestStar();
		delete this.game.stars[this.spottedStar.name];
		delete this.spottedStar;

		if (this.smallestStar.value >= this.minStar && Object.keys(this.haveStar).length == 2)
		{
			this.say('Собрал хорошие звезды :) Возвращаюсь на корабль!');
			// Случайным образом выбираю с какой стороны подплывать к тросу
			this.newPurpose('ascent', Math.random()>.5?620:585, 480);
		}else{this.newPurpose('scan', (this.direction=='l'?-1:this.game.ctx.canvas.width), 480)}
		this.spottedStar = {name:'empty', value:0};
	},

	/**
	 * Установка наименьшей звезды
	 */
	setSmallestStar : function()
	{
		this.smallestStar = {name:'empty', value:10};
		for(var hs in this.haveStar)
		{
			if (this.haveStar[hs].value <= this.smallestStar.value) this.smallestStar = this.haveStar[hs];
		}
	},

	/**
	 * Сброс наименьшей звезды
	 */
	trowStar : function(){
		this.say("Бросаю звезду " + this.smallestStar.value);
		var star = this.game.stars[this.smallestStar.name] = this.haveStar[this.smallestStar.name];
		star.state = 'free';
		star.position.y += - 4;
		star.direction = "d";
		delete this.haveStar[this.smallestStar.name];
		this.setSmallestStar();
	}
}

/**
 * Функция-конструктор объекта Игры
 */
var DiverGame = function()
{
	/**
	 * Вспомогательная функция для загрузки изображений (New Image)
	 *
	 * @param  String path Путь к изображению
	 */
	this.ni = function (path)
	{
		var image = new Image();
		image.src = path;
		return image;
	}

	/**
	 * Библиотека изображений
	 */
	this.images = {
		wave1 : this.ni('images/wave1.png'),
		wave2 : this.ni('images/wave2.png'),
		wave3 : this.ni('images/wave3.png'),

		cloud : this.ni('images/cloud.png'),
		clouds : this.ni('images/clouds.png'),
		clouds8 : this.ni('images/clouds8.png'),
		cloudss : this.ni('images/cloudss.png'),

		fishes75x50 : this.ni('images/fishes75-50.png'),
		fishes75x50r : this.ni('images/fishes75-50r.png'),

		fishes75x100 : this.ni('images/fishes75-100.png'),
		fishes75x100r : this.ni('images/fishes75-100r.png'),

		fishes50x75 : this.ni('images/fishes50-75.png'),
		fishes50x75r : this.ni('images/fishes50-75r.png'),

		fishes2 : this.ni('images/fishes2.png'),
		fishes2r : this.ni('images/fishes2r.png'),

		shipEmpty : this.ni('images/ship-empty.png'),

		diverdown: this.ni('images/Diver-tros.png'),
		diverleft: this.ni('images/Diver-go-harvest.png'),
		diverright: this.ni('images/Diver-go-home.png'),
		diverup: this.ni('images/Diver-tros-up.png'),

		star1: this.ni('images/tf-star1.png'),
		star2: this.ni('images/tf-star2.png'),
		star3: this.ni('images/tf-star3.png'),
		star4: this.ni('images/tf-star4.png'),
		star5: this.ni('images/tf-star5.png'),
		star6: this.ni('images/tf-star6.png'),
		star7: this.ni('images/tf-star7.png'),
		star8: this.ni('images/tf-star8.png'),
		star9: this.ni('images/tf-star9.png'),
		star10: this.ni('images/tf-star10.png'),

		thought: this.ni('images/thought.png'),

		tros : this.ni('images/tros.png')
	}
	// ссылка на себя
	this.self = this;

	this.config = {
		// Id Элемента игрового холста
		canvasId : 'gamecanvas',
		// Интервал перерисовки
		period : 10,
		// Скорость дайвера (пикс/сек)
		diverSpeed : 20,
		// Скорость падения звезд
		starSpeed : 80,
		// havestars positions
		hsp : {
			l: [-35, 17, -25, 31], r: [35, 17, 25, 31],
			ul: [25, -8, 15, 6], ur: [-45, - 8, -35, 6]
			}
	}

	this.date = new Date();
	this.fps = 20;

	// Контекст холста
	this.ctx = null;

	// Флаг отрисовки
	this.rendered = true;

	// Счетчик для отрисовки фона
	this.iterator = 0;

	// Id интервала обновления
	this.intervalId = 1;

	// Флаг паузы игры
	this.paused = true;

	// Буфер игры, для запоминания позиций
	this.buffer = {}

	// пользователь компрессора
	this.compressorUser = null;

	// Собранные со дна звезды
	this.foundStars = {};

	// Дайверы, находящиеся в игре
	this.divers = {};

	// Звезды в воде
	this.stars = {};
}
DiverGame.prototype = {
	/**
	 * Инициализация игры
	 */
	init : function(conf)
	{
		var self = this;
		if (conf) for (var c in conf) this.config[c] = conf[c];
		var gameCanvas = ge(this.config.canvasId);
		// Событие mousedown юзабильнее click
		gameCanvas.onmousedown = function(e){
			var base = ge("main");
			var x = (document.documentElement.scrollLeft || document.body.scrollLeft) + e.clientX - base.offsetLeft - this.offsetLeft;
			var y = (document.documentElement.scrollTop || document.body.scrollTop)  + e.clientY - base.offsetTop - this.offsetTop;
			if (y < 100 || y > 560) return;
			self.addStar(x > 33 ? (x > this.width - 23 ? x - 66 : x - 33) : x, y - 23);
		}
		gameCanvas.onclick = function(){ return false; }
		gameCanvas.ondblclick = function(){ return false; }
		if (!gameCanvas.getContext) return;
		this.ctx = gameCanvas.getContext('2d');  // Контекст холста
		this.ctx.canvas.width = 720;
		this.ctx.canvas.height = 600;
		this.ctx.drawImageR = function(img,x,y){
			this.drawImage(img, (.5+x)|0, (.5+y)|0);
		}
		this.addDiver();
		this.play();
	},

	/**
	 * Запуск игры
	 */
	play : function()
	{
		if (!this.paused) return;
		this.paused = false;
		this.date = new Date();
		var self = this;
		this.intervalId = setInterval(function(){
			self.renderGame(self.iterator++)
		}, this.config.period);
	},

	/**
	 * Остановка игры
	 */
	pause : function()
	{
		clearInterval(this.intervalId);
		this.paused = true;
	},

	/**
	 * Добавление нового дайвера
	 */
	addDiver : function()
	{
		this.divers['Diver' + ++this.iterator] = new Diver(this);
	},

	/**
	 * Удаление дайвера с поверхности
	 */
	deleteDiver : function()
	{
		for (var d in this.divers)
		{
			if (this.divers[d].state != 'zapravka') continue;
			if (this.compressorUser == this.divers[d].name) this.compressorUser = null;
			this.divers[d].say("Ухожу на корабль");
			this.divers[d].state = 'delete';
			return;
		}
		for (var d in this.divers)
		{
			if (this.divers[d].state != 'scan') continue;
			this.divers[d].say("Вызывают на корабль...");
			if (this.divers[d].spottedStar.name != 'empty') this.stars[this.divers[d].spottedStar.name].state = "free";
			this.divers[d].newPurpose('ascent', Math.random()>.5?620:585, 480);
			return;
		}
	},

	/**
	 * Добавление новой звезды в указанных координатах
	 *
	 * @param integer x
	 * @param integer y
	 */
	addStar : function(x, y)
	{
		this.stars['Star' + ++this.iterator] = new Star(x, y, this);
	},

	/**
	 * Вспомогательная функция для отрисовки рыб движущихся с разной скоростью
	 *
	 * @param Intager iterator Текущая итерация игры
	 * @param float vx Скорость движения по x
	 * @param float vy Скорость движения по y
	 * @param Integer w Ширина холста
	 * @param Integer h Высота холста
	 */
	fishXY : function(iterator, vx, vy, w, h)
	{
		return {
			x : Math.abs(iterator*vx % (w + 100) * 2 - (w + 100)) - 100,
			y : Math.abs(iterator*vy % (h - 270) * 2 - (h - 270)) + 150
		}
	},

	/**
	 * Отрисовка фона с рыбками, волнами, облаками
	 *
	 * @param Intager iterator Текущая итерация игры
	 */
	renderBackground : function(iterator)
	{
		var w = this.ctx.canvas.width;
		var h = this.ctx.canvas.height;

		// Первые две волны
		var waveDelta = Math.abs(iterator/2 % 25);
		this.ctx.drawImageR(this.images.wave1, waveDelta - 30, 66);
		this.ctx.drawImageR(this.images.wave2, -waveDelta, 80);

		// Облака
		var cloudIterator = iterator + 1000;
		this.ctx.drawImageR(this.images.cloudss, cloudIterator/1.6 % (w + 150) - 75, 0);
		this.ctx.drawImageR(this.images.clouds, cloudIterator/1.4 % (w + 100) - 75, 5);
		this.ctx.drawImageR(this.images.cloud, cloudIterator/1.3 % (w + 100) - 75, 8);
		this.ctx.drawImageR(this.images.clouds, cloudIterator/1.2 % (w + 75) - 75, 15);
		this.ctx.drawImageR(this.images.clouds8, cloudIterator % (w + 75) - 75, 25);

		// Рисуем звезды на корабле
		var values = [];
		for(var s in this.foundStars)
		{
			this.foundStars[s].position.x = 480 + this.foundStars[s].value * 15;
			this.foundStars[s].position.y = 30 + Math.round(Math.abs(iterator/5 % 4 - 2)) - (this.foundStars[s].value * 2) % 10;
			if (values.indexOf(this.foundStars[s].value) == -1)
			{
				this.foundStars[s].render(this.ctx);
				values.push(this.foundStars[s].value);
			}
		}

		// Корабль и третья волна
		this.ctx.drawImageR(this.images.shipEmpty, 512, Math.abs(iterator/5 % 4 - 2));
		this.ctx.drawImageR(this.images.wave3, waveDelta - 25, 94);

		// Звезды
		for(var s in this.stars) this.stars[s].render(this.ctx);

		// А теперь группы рыб
		// fp - Fish Position - Координаты рыбы
		var fp = this.fishXY(iterator + 300, .5, .3, w, h);
		this.ctx.drawImageR(this.buffer['fish0'] > fp.x ? this.images.fishes75x50 : this.images.fishes75x50r, fp.x, fp.y);
		this.buffer['fish0'] = fp.x;

		fp = this.fishXY(iterator, 1.5, .5, w, h);
		this.ctx.drawImageR(this.buffer['fish1'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish1'] = fp.x;

		fp = this.fishXY(iterator + 500, 1, .7, w, h);
		this.ctx.drawImageR(this.buffer['fish2'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish2'] = fp.x;

		fp = this.fishXY(iterator + 100, 2, .2, w, h);
		this.ctx.drawImageR(this.buffer['fish3'] > fp.x ? this.images.fishes50x75 : this.images.fishes50x75r, fp.x, fp.y);
		this.buffer['fish3'] = fp.x;

		fp = this.fishXY(iterator + 1000, .5, .3, w, h);
		this.ctx.drawImageR(this.buffer['fish4'] > fp.x ? this.images.fishes75x100 : this.images.fishes75x100r, fp.x, fp.y);
		this.buffer['fish4'] = fp.x;

		fp = this.fishXY(iterator + 1500, .5, .2, w, h);
		this.ctx.drawImageR(this.buffer['fish5'] > fp.x ? this.images.fishes2 : this.images.fishes2r, fp.x, fp.y);
		this.buffer['fish5'] = fp.x;

		// Трос ближе всех
		this.ctx.drawImageR(this.images.tros, 592, 64);
	},

	/**
	 * Отрисовка всех элементов игры
	 */
	renderGame : function(iterator)
	{
		if (!this.rendered) { return; }
		this.rendered = false;
		this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
		this.ctx.save();		
		// фон
		this.renderBackground(iterator);
		// Дайверы
		for(var d in this.divers) this.divers[d].render(this.ctx);
		
		this.ctx.restore();
		
		// Пишем FPS
		ge('fps').innerHTML = this.fps;
		// Не храним историю радиосвязи...
		if (ge('diverRadio').innerHTML.length > 1000) ge('diverRadio').innerHTML = ge('diverRadio').innerHTML.substr(0, 1000);

		var сd = new Date();
		this.fps = Math.ceil(((1000 / (сd - this.date)) + this.fps) / 2);
		this.fps = this.fps > (1000/this.config.period) ? (1000/this.config.period) : this.fps // fix IE
		this.date = Math.round(сd);
		this.rendered = true;
	},

	/**
	 * Изменение размеров Холста
	 */
	changeSize : function(w,h)
	{
		if (w < 720) w = 720;
		if (w > 1440) w = 1440;
		h = 600;
		var backCanvas = ge("backCanvas");
		var main = ge("main");
		backCanvas.style.width = w + 'px';
		main.style.width = (w + 40) + 'px';
		this.ctx.canvas.width = w;
		backCanvas.style.height = h + 'px';
		this.ctx.canvas.height = h;
	},

	/**
	 * Сбор статистики
	 *
	 * @param <type> eId HTML элемент, куда все писать
	 */
	getStatistic : function(eId)
	{
		var inWater = {};
		var found = {};
		var pd = {}; // per Diver
		var str = "<strong>В воде звезд: " + Object.keys(this.stars).length + "</strong><br/>";

		for (var s in this.stars){
			if (!inWater[this.stars[s].value]) inWater[this.stars[s].value] = 0;
			inWater[this.stars[s].value] += 1;
		}

		for(var i = 10; i >= 1; i--)
		{
			if (!inWater[i]) continue;
			str += "Номиналом " + i + ": " + inWater[i] + "<br/>";
		}

		str += "<br/><strong>Собрано звезд: " + Object.keys(this.foundStars).length + "</strong><br/>";

		for (var s in this.foundStars){
			if (!pd[this.foundStars[s].owner]) pd[this.foundStars[s].owner] = 0;
			if (!found[this.foundStars[s].value]) found[this.foundStars[s].value] = 0;
			found[this.foundStars[s].value] += 1;
			pd[this.foundStars[s].owner] += 1;
		}
		for(var i = 10; i >= 1; i--)
		{
			if (!found[i]) continue;
			str += "Номиналом " + i + ": " + found[i] + "<br/>";
		}

		str += "<br/><strong>Лучшие дайверы:</strong><br/>";
		for(var d in pd)
		{
			str += "<strong>" + d + ":</strong> "+ pd[d] + "<br/>";
		}

		ge(eId).innerHTML = str;
	}
}

var dg = new DiverGame();
window.ge = function(el){return document.getElementById(el)};
window.onload = function()
{
	dg.init({canvasId:'backCanvas', period: 10, diverSpeed:20});
	ge("loading").style.display = "none";
	ge("addDiver").onclick = function(e){dg.addDiver(); return false;};
	ge("deleteDiver").onclick = function(e){dg.deleteDiver(); return false;};

	// Все что ниже - дополнительный функционал к игре
	ge("pause").onclick = function(e){dg.pause()};
	ge("play").onclick = function(e){dg.play()};
	ge("diverRadioHeader").onclick = function(e){
		if (ge("diverRadio").style.display && ge("diverRadio").style.display != 'none'){
			ge("diverRadio").style.display = 'none';
			ge("diverRadio").innerHTML = "Начинаем слушать радиосвязь =)";
		}
		else{
			ge("diverRadio").style.display = 'block';
		}
	};

	ge("statisticHeader").onclick = function(e){ dg.getStatistic('statistic');	};
}
// Перед обновлением окна или перед его закрытием, останавливаем игру
window.onbeforeunload  = function () {dg.pause()}