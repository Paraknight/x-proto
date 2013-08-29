GAME.namespace('world').Scene = function (game, name, onload) {
	THREE.Scene.call(this);

	this.entityManager = new GAME.entities.EntityManager(this);

	var self = this;

	game.setLoadingText('Loading Scene...');
	GAME.utils.xhrAsyncGet('./scenes/'+name+'.js', function (scene) {
		scene = eval(scene);//JSON.parse(scene);
		
		var grav = scene.gravity || [0, -9.81, 0];
		//self.setGravity(new THREE.Vector3().fromArray(grav));

		
		var countdown = new GAME.utils.Countdown(3, function () {
			/* Initialise Scene */
			game.setLoadingText('Initialising Scene...');
			scene.init.call(self);
			onload();
		});

		/* Load Models */
		game.setLoadingText('Loading Models...');
		GAME.models.load(scene.models, function() {
			countdown.dec();
		});

		/* Load Entities */
		game.setLoadingText('Loading Entities...');
		GAME.entities.load(scene.entities, function() {
			countdown.dec();
		});

		/* Create Player */
		var player = game.player = self.player = new GAME.player.Player(self);
		player.position.fromArray(scene.player.position || [0,0,0]);

		switch (scene.player.controller) {
		case 'firstperson':
			player.controller = new GAME.player.PlayerController(self, player);
			game.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
			player.head.add(game.camera);
			break;
		default:
			break;
		}

		// TODO: Consider restructuring to make PlayerController superior.
		player.tick = function (delta) {
			this.controller.update(delta);
			this.scene.entityManager.tickQueue.add(this);
		};
		self.entityManager.tickQueue.add(player);

		// TODO: Should player and children cast shadows?
		self.add(player);

		countdown.dec();
	});
};

GAME.world.Scene.prototype = Object.create(THREE.Scene.prototype);

GAME.world.Scene.prototype.add = function (entity) {
	THREE.Scene.prototype.add.call(this, entity);
	if ('collider' in entity)
		this.entityManager.physicsSim.entityList.add(entity);
	if ('onSpawn' in entity)
		entity.onSpawn();
};

GAME.world.Scene.prototype.remove = function (entity) {
	THREE.Scene.prototype.remove.call(this, entity);
	if ('collider' in entity)
		this.entityManager.physicsSim.entityList.remove(entity);
};

GAME.world.Scene.prototype.tick = function (delta) {
	this.entityManager.tick(delta);
};

GAME.world.Scene.prototype.animate = function (delta) {
	this.entityManager.animate(delta);
};