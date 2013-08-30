GAME.namespace('entities').load = function(entities, callback) {
	if (entities === undefined || entities.length < 1) {
		callback();
		return;
	}
	
	var countdown = new GAME.utils.Countdown(entities.length, callback);

	function loadEntity (path) {
		GAME.utils.xhrAsyncGet('entities/'+path.replace('.','/')+'.js', function (js) {
			eval(js);
			countdown.dec();
		});
	}

	for (var i = 0, len = entities.length; i < len; i++)
		loadEntity(entities[i]);
};

GAME.entities.EntityManager = function (scene) {
	this.scene = scene;

	// TODO: Extend to all entities.
	this.players = {};

	this.tickQueue = new GAME.utils.List();
	this.animQueue = new GAME.utils.List();
};

GAME.entities.EntityManager.prototype.spawnPlayer = function(username, state) {
	this.players[username] = new GAME.player.Player(this.scene).addModel();
	this.players[username].serverState = state;
	this.players[username].position.copy(state.pos);
	this.players[username].rotation.copy(state.rot);
	this.tickQueue.add(this.players[username]);
	this.scene.add(this.players[username]);
};

GAME.entities.EntityManager.prototype.despawnPlayer = function(username) {
	this.scene.remove(this.players[username]);
	this.players[username].despawned = true;
	delete this.players[username];
};

GAME.entities.EntityManager.prototype.tick = function(delta) {
	for (var i = 0, size = this.tickQueue.size; i < size; i++)
		this.tickQueue.poll().tick(delta);
};

GAME.entities.EntityManager.prototype.animate = function(delta) {
	for (var i = 0, size = this.animQueue.size; i < size; i++)
		this.animQueue.poll().animate(delta);

	this.scene.simulate(delta);
};