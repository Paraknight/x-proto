GAME.namespace('entities').EntityManager = function (scene) {
	this.scene = scene;

	// TODO: Extend to all entities.
	this.players = {};

	this.tickQueue = new GAME.utils.Queue();
	this.animQueue = new GAME.utils.Queue();
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
};