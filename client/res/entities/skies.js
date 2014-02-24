GAME.namespace('entities.skies').SkyEarth = function (scene) {
	THREE.Object3D.call(this);

	this.scene = scene;

	var game = GAME.game;

	//game.setLoadingText('Creating Sky...');

	this.position = scene.player.position;

	//starCoords = [new THREE.Vector2(10, 10), new THREE.Vector2(20, 20)];
	//starSizes = [1.0, 1.0];

	game.time = 0.0;

	var skyMat = new THREE.ShaderMaterial(GAME.shaders.sky);
	skyMat.side = THREE.BackSide;
	skyMat.transparent = true;
	var skyMesh = new THREE.Mesh(new THREE.SphereGeometry(9000, 16, 16), skyMat);
	//skyMesh.rotation.y = -0.5 * Math.PI;
	this.add(skyMesh);
	//this.add(new THREE.Mesh(new THREE.SphereGeometry(1000, 8, 4, 0, 2 * Math.PI, 0, Math.PI * 0.5), new THREE.MeshBasicMaterial({ color: 0x00EE00/*0x220044*/, wireframe: true, transparent: true })));

	var skyPivot = new THREE.Object3D();
	// TODO: Calculate sun's actual diameter (IRL, angular diameter = 0.5°).
	var sun = new THREE.Mesh(new THREE.PlaneGeometry(2500, 2500), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('res/textures/sun.png'), transparent: true, fog: false, color: 0xFFCC33 }));
	sun.position.x = 7800;
	sun.lookAt(new THREE.Vector3());
	skyPivot.add(sun);
	var moon = new THREE.Mesh(new THREE.PlaneGeometry(2500, 2500), new THREE.MeshBasicMaterial({ map: THREE.ImageUtils.loadTexture('res/textures/moon.png'), transparent: true, fog: false }));
	moon.position.x = -7800;
	moon.lookAt(new THREE.Vector3());
	skyPivot.add(moon);
	this.add(skyPivot);

	// TODO: Make stars move independently of sun and moon.
	//var starPivot = new THREE.Object3D();
	var starDist = 9500;
	function addStar(ra, dec, scale) {
		var star = new THREE.Mesh(new THREE.PlaneGeometry(scale*20, scale*20), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, fog: false }));
		star.position.x = Math.cos(dec) * Math.sin(ra) * starDist;
		star.position.y = Math.sin(dec) * starDist;
		star.position.z = -Math.cos(dec) * Math.cos(ra) * starDist;
		star.lookAt(new THREE.Vector3());
		skyPivot.add(star);
		//starPivot.add(star);
	}
	//game.setLoadingText('Generating Stars...');
	var counter = 0;
	for (var dec = -90; dec <= 90; dec++) {
		for (var ra = 0; ra < 360; ra++) {
			var n = GAME.utils.noise.noise(1, ra, dec+90, 1);
			if (n < -0.99-((dec*dec)/810000)) {
				counter++;
				addStar((ra/180.0) * Math.PI, (dec/180.0) * Math.PI, 2.0+n);
			}
		}
	}
	//console.log('Done: '+counter+' stars generated.');
	//this.add(starPivot);

	var sunHemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 0.3);
	//hemiLight.color.setHSL(0.6, 1, 0.6);
	//hemiLight.groundColor.setHSL(0.095, 1, 0.75);
	sunHemiLight.position.set(0.0, 1000.0, 0.0);
	this.add(sunHemiLight);
	var sunDirLight = new THREE.DirectionalLight(0xFFFFFF, 0.0);
	scene.player._sun = new THREE.Object3D();
	sunDirLight.position = scene.player._sun.position;
	sunDirLight.position.set(20.0, 0.0, 0.0);
	sunDirLight.castShadow = true;
	sunDirLight.shadowMapWidth = 2048;
	sunDirLight.shadowMapHeight = 2048;
	sunDirLight.shadowCameraRight = 20;
	sunDirLight.shadowCameraLeft = -20;
	sunDirLight.shadowCameraTop = 20;
	sunDirLight.shadowCameraBottom = -20;
	sunDirLight.shadowCameraNear = 1;
	sunDirLight.shadowCameraFar = 40;
	//sunDirLight.shadowBias = 0.001;
	//sunDirLight.shadowCameraVisible = true;
	sunDirLight.target = scene.player;
	this.add(sunDirLight);

	// TODO: Move to prototype.
	this.animate = function (delta) {
		game.time = (game.time+0.0001)%1.0;
		var time = game.time;
		GAME.shaders.sky.uniforms.time.value = time;
		var rot = time*2.0*Math.PI;
		skyPivot.rotation.z = rot;
		var height = Math.sin(rot);
		sun.material.color.setHSL(0.13, 1.0, 0.8+(height<0.0?0.0:0.2*Math.pow(height,0.5)));
		this.scene.player._sun.position.set(20.0*Math.cos(rot), 20.0*height, 0.0);
		sunDirLight.intensity = 0.25*height+0.25;
		sunDirLight.shadowDarkness = Math.max(0.0, 0.5*height);
		//sunHemiLight.intensity = 0.5*height;
		sunHemiLight.groundColor.setHSL(0.7, 1.0, 0.5+(0.25*(height+1.0)));
		this.scene.entityManager.animQueue.add(this);
	};
};

GAME.entities.skies.SkyEarth.prototype = Object.create(THREE.Object3D.prototype);

GAME.entities.skies.SkyEarth.prototype.onSpawn = function () {
	this.scene.entityManager.animQueue.add(this);
};