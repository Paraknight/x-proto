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
			scene.init.apply(self);
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

// TODO: Structure.
GAME.world.buildSceneIsland = function (game, onload) {
	var scene = game.scene = new GAME.world.Scene(game, 'island', function () {

		//player.add(new GAME.entities.tools.Axe());

		scene.add(new GAME.entities.skies.SkyEarth(scene));


		/* Terrain */
		var seed = 1;
		var terrain = new GAME.entities.terrain.TerrainIsland(scene, seed);
		scene.add(terrain);


		/* Forest */
		game.setLoadingText('Generating forest...');
		var heightMap = terrain.heightMap;
		var rand;
		for (var x = 0, xWorld = -512, lenX = heightMap.length; x < lenX; x++, xWorld+=4) {
			for (var z = 0, zWorld = -512, lenZ = heightMap[x].length; z < lenZ; z++, zWorld+=4) {
				rand = GAME.utils.noise.noise(seed, x, z, 0);
				if (rand > 0.9) {
					var height = heightMap[x][z];
					if (height < 16.32) continue;
					var tree = new GAME.entities.flora.Tree(scene);
					tree.position.set(xWorld, height+2.0, zWorld);
					tree.rotation.set(0, (rand-0.9)*20.0*Math.PI, 0);
					scene.add(tree);
				}
			}
		}


		/* Fog */
		game.scene.fog = new THREE.FogExp2(0xFFFFFF, 0.0025);
		// TODO: Same as sky.
		game.scene.fog.tick = function (delta) {
			var height = Math.sin(game.time*2.0*Math.PI);
			this.color.setHSL(0.0, 0.0, 0.5*(height<0.0?-Math.pow(-height,0.5):Math.pow(height,0.5))+0.5);
			game.scene.entityManager.tickQueue.add(this);
		};
		game.scene.entityManager.tickQueue.add(game.scene.fog);


		/* Monolith */
		// NOTE: Box.
		var monolith = new THREE.Mesh(new THREE.CubeGeometry(2, 10, 2), new THREE.MeshPhongMaterial({ color: 0xFF0000 }));
		monolith.position.y = 100;
		monolith.castShadow = true;
		monolith.receiveShadow = true;
		monolith.collider = new GAME.physics.Collider(new GAME.physics.AABB(monolith.position, 2, 10), 1000, 0.5, 0.5);
		
		var spotLight = new THREE.SpotLight(0xFFFFFF, 1, 1000);
		spotLight.position.set(10, 69, 10);
		spotLight.castShadow = true;
		//spotLight.shadowCameraVisible = true;
		spotLight.shadowCameraNear = 5;
		spotLight.shadowCameraFar = 500;
		//spotLight.shadowCameraRight = 50;
		//spotLight.shadowCameraLeft = -50;
		//spotLight.shadowCameraTop = 50;
		//spotLight.shadowCameraBottom = -50;
		spotLight.shadowMapWidth = 1024;
		spotLight.shadowMapHeight = 1024;
		spotLight.tick = function (delta) {
			this.intensity = 1.0-(0.5*(Math.sin(game.time*2.0*Math.PI)+1.0));
			this.shadowDarkness = 0.5*this.intensity;
			game.scene.entityManager.tickQueue.add(this);
		};
		game.scene.entityManager.tickQueue.add(spotLight);
		game.scene.add(spotLight);

		spotLight.target = monolith;
		game.scene.add(monolith);


		/* Radio */
		var radioCollider = new THREE.Mesh(new THREE.CubeGeometry(0.3, 0.25, 0.3), new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true }));
		radioCollider.position.x = -10;
		radioCollider.position.y = 45;//42;
		radioCollider.collider = new GAME.physics.Collider(new GAME.physics.AABB(radioCollider.position, 0.3, 0.25), 1);
		//radioCollider.setCcdMotionThreshold(0.5);
		//radioCollider.setCcdSweptSphereRadius(0.1);
		//radioCollider.visible = false;
		var radioMesh = new THREE.Mesh(GAME.models.portalradio.portalradio.geom, new THREE.MeshFaceMaterial(GAME.models.portalradio.portalradio.mats));
		radioMesh.scale.set(2,2,2);
		radioMesh.position.y = 0.16;
		radioMesh.castShadow = true;
		radioMesh.receiveShadow = true;
		radioCollider.add(radioMesh);
		game.scene.add(radioCollider);
		// TODO: Load all sounds in the beginning too?
		GAME.audio.load(['audio/mplith.ogg'], function(source) {
			source.setPosition(radioCollider.position);
			source.setLoop(true);
			//source.play();
			// TODO: Solid trigger.
			radioCollider.onCollision = function (entity) {
				if (entity.collider.colShape.type === 'sphere')
					source.getAudioFlag('paused')?source.play():source.pause();
			};
			radioMesh.animate = function (delta) {
				source.setPosition(radioCollider.position);
				var freqByteData = new Uint8Array(source.analyser.frequencyBinCount);
				source.analyser.getByteTimeDomainData(freqByteData);
				var scaleFactor = (Math.max.apply(Math, freqByteData)/150)+1;
				this.scale.set(scaleFactor, scaleFactor, scaleFactor);
				game.scene.entityManager.animQueue.add(this);
			};
			game.scene.entityManager.animQueue.add(radioMesh);
		}, true);


		function spawnButterfly () {
			var monarch = new GAME.entities.bugs.Butterfly(scene, 'monarch', 0.1);
			monarch.position.copy(game.player.position);
			monarch.position.y += 0.75;
			// FIXME: Look direction inverted?
			monarch.lookAt(game.player.head.localToWorld(new THREE.Vector3(0,0,1)));
			monarch.updateMatrixWorld();

			game.scene.add(monarch);
		}


		function butterflyBomb () {
			for (var i = 0; i < 50; i++)
				spawnButterfly();
		}

		document.addEventListener('keydown', function (event) {
			if (event.keyCode == 86 && game.player.controller.enabled)
				butterflyBomb();
		});

		/*
		// NOTE: Box.
		var triggerCollider = new THREE.Mesh(new THREE.CubeGeometry(4, 4, 4), new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true }), 0);
		triggerCollider._physijs.collision_flags = 4;
		triggerCollider.position.copy(game.player.position).z -= 10;
		triggerCollider.addEventListener('collision', function(other_object, relative_velocity, relative_rotation) {
			console.log(other_object);
		});
		game.scene.add(triggerCollider);
		*/

		// FIXME: Do this outside.
		game.tickList.push(game.scene);
		game.animList.push(game.scene);
		onload();
	});
};