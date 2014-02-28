GAME.namespace('save').ISave = function() {
};

GAME.save.ISave.prototype.save = function (key, data) {};

GAME.save.ISave.prototype.load = function (key) {};

GAME.save.ISave.prototype.delete = function (key) {};


GAME.save.SaveLocal = function() {
	if (!('localStorage' in window) || window.localStorage === null)
		console.error('## Your browser does not support local storage. Get with the times! ##');
};

GAME.save.SaveLocal.prototype = Object.create(GAME.save.ISave.prototype);

GAME.save.SaveLocal.prototype.save = localStorage.setItem;

GAME.save.SaveLocal.prototype.load = localStorage.getItem;

GAME.save.SaveLocal.prototype.delete = localStorage.removeItem;


GAME.save.SaveScene = function(isave) {
	
};

//GAME.save.SaveLocal.prototype = Object.create(GAME.save.ISave.prototype);

GAME.save.SaveLocal.prototype.save = localStorage.setItem;

GAME.save.SaveLocal.prototype.load = localStorage.getItem;

GAME.save.SaveLocal.prototype.delete = localStorage.removeItem;