GAME.scenes.island = {
	name: 'Island',
	models: [
		'tools.axe',
		'tree.tree',
		'tree.timber',
		'tree.stump',
		'portalradio.portalradio',
		'player.torso',
		'player.head'
	],
	player: {
		position: [0,45,20],
		controller: 'firstperson'
	},
	entities: [
		'skies',
		'terrain',
		'flora',
		'bugs',
		'tools',
		'misc'
	],
	init: function () {
		var game = GAME.game;
		var scene = this;

		this.player.add(new GAME.entities.tools.Axe(scene).setOwner(this.player));

		scene.add(new GAME.entities.skies.SkyEarth(scene));


		/* Terrain */
		var seed = 1;
		var terrain = new GAME.entities.terrain.TerrainIsland(scene, seed);
		scene.add(terrain);


		/* Forest */
		//game.setLoadingText('Generating forest...');
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
		var monolith = new Physijs.BoxMesh(new THREE.CubeGeometry(2, 10, 2), new THREE.MeshPhongMaterial({ color: 0xFF0000 }));
		monolith.position.y = 100;
		monolith.castShadow = true;
		monolith.receiveShadow = true;
		var collisionCounter = 0;
		monolith.addEventListener('collision', function(other_object, relative_velocity, relative_rotation, contact_normal) {
			if (other_object instanceof Physijs.SphereMesh) {
				collisionCounter++;
				if (collisionCounter >= 100) {
					monolith.setLinearVelocity(new THREE.Vector3(0,20,0));
					monolith.setAngularVelocity(new THREE.Vector3(1,1,1));
					collisionCounter = 0;
				}
			}
		});
		scene.add(monolith);
		var sphere = new Physijs.SphereMesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: false, transparent: true }));
		sphere.position.y = 105;
		sphere._physijs.collision_flags = 4;
		sphere.addEventListener('collision', function (other_object) {
			if (other_object instanceof Physijs.SphereMesh)
				sphere.material.color = new THREE.Color((Math.random()*0xFFFFFF)>>0);
		});
		scene.add(sphere);
		/*var constraint = new Physijs.PointConstraint(
			monolith,
			sphere,
			new THREE.Vector3(0, 110, 0)
		);
		game.scene.addConstraint(constraint, true);*/
		var constraint = new Physijs.DOFConstraint(
			monolith,
			sphere,
			new THREE.Vector3(0, 105, 0)
		);
		scene.addConstraint(constraint);
		constraint.setLinearLowerLimit(new THREE.Vector3());
		constraint.setLinearUpperLimit(new THREE.Vector3());
		constraint.setAngularLowerLimit(new THREE.Vector3());
		constraint.setAngularUpperLimit(new THREE.Vector3());

		
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


		/* Radio */
		var radioCollider = new Physijs.BoxMesh(new THREE.CubeGeometry(0.5, 0.5, 0.25), new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true }));
		radioCollider.position.x = -10;
		radioCollider.position.y = 42;
		//radioCollider.setCcdMotionThreshold(0.5);
		//radioCollider.setCcdSweptSphereRadius(0.1);
		//radioCollider.visible = false;
		var radioMesh = new THREE.Mesh(GAME.models.portalradio.portalradio.geom, new THREE.MeshFaceMaterial(GAME.models.portalradio.portalradio.mats));
		radioMesh.scale.set(2,2,2);
		radioMesh.position.y = 0.05;
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
			radioCollider.addEventListener('collision', function(other_object, relative_velocity, relative_rotation) {
				if (other_object instanceof Physijs.SphereMesh)
					source.getAudioFlag('paused')?source.play():source.pause();
			});
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


		var trigger = new GAME.entities.misc.Trigger(4, 4, 4, function(other_object, relative_velocity, relative_rotation) {
			console.log(other_object);
		});
		trigger.position.copy(game.player.position).z -= 10;
		scene.add(trigger);
	}
};