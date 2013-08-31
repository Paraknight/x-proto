GAME.namespace('world').Scene = function (game, name, onload) {
	Physijs.Scene.call(this);

	var countdown1 = new GAME.utils.Countdown(2, function () {
		onload();
	});

	this.addEventListener('ready', function() {
		console.log('Physics Engine initialised.');
		countdown1.dec();
	});

	this.entityManager = new GAME.entities.EntityManager(this);

	var self = this;

	game.setLoadingText('Loading Scene...');
	GAME.utils.xhrAsyncGet('./scenes/'+name+'.js', function (scene) {
		//game.setLoadingText('Loading Assets...');

		scene = eval(scene);//JSON.parse(scene);
		
		var grav = scene.gravity || [0, -9.81, 0];
		//self.setGravity(new THREE.Vector3().fromArray(grav));

		
		var countdown2 = new GAME.utils.Countdown(3, function () {
			/* Initialise Scene */
			//game.setLoadingText('Initialising Scene...');
			scene.init.call(self);
			countdown1.dec();
		});

		/* Load Models */
		GAME.models.load(scene.models, function() {
			countdown2.dec();
		});

		/* Load Entities */
		GAME.entities.load(scene.entities, function() {
			countdown2.dec();
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

		countdown2.dec();
	});
};

GAME.world.Scene.prototype = Object.create(Physijs.Scene.prototype);

GAME.world.Scene.prototype.add = function (entity) {
	Physijs.Scene.prototype.add.call(this, entity);
	if ('onSpawn' in entity)
		entity.onSpawn();
};

GAME.world.Scene.prototype.remove = function (entity) {
	Physijs.Scene.prototype.remove.call(this, entity);
};

GAME.world.Scene.prototype.tick = function (delta) {
	this.entityManager.tick(delta);
};

GAME.world.Scene.prototype.animate = function (delta) {
	this.entityManager.animate(delta);
};