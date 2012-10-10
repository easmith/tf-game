/*
function Game(ctx, units)
{
	var newImage = function (path) {
		var image = new Image();
		image.src = path;
		return image;
	}

	var cloud = newImage('images/cloud.png');

		gameField.onclick = function(e){
			gameContext.save();
			var base = document.getElementById("main");
			if (!e) var e = window.event;
			var x = document.body.scrollLeft + e.clientX - base.offsetLeft - this.offsetLeft;
			var y = document.body.scrollTop + e.clientY - base.offsetTop - this.offsetTop;
			gameContext.drawImage(bgu.cloud, x, y);
			gameContext.restore();
		}
}
*/
