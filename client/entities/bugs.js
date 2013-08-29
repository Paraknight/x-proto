GAME.namespace('entities.bugs').Butterfly = (function () {
	var game = GAME.game;

	var wingRot = { y: 0.25*Math.PI };

	var tweenUp = new TWEEN.Tween(wingRot)
			.to({ y: -0.25*Math.PI }, 200)
			//.easing(TWEEN.Easing.Elastic.InOut)
			//.onUpdate(updateWingRotation);

	var tweenDown = new TWEEN.Tween(wingRot)
			.to({ y: 0.25*Math.PI }, 100)
			//.easing(TWEEN.Easing.Elastic.InOut)
			//.onUpdate(updateWingRotation)
			.chain(tweenUp);

	tweenUp.chain(tweenDown).start();

	function setButterflyWingAngle (angle) {
		this.children[0].rotation.y = -angle;
		this.children[1].rotation.y = angle;
	}

	function animateButterfly (delta) {
		this.setWingAngle(wingRot.y);
		this.rotation.x += 0.1*(Math.random()-0.5);
		this.rotation.y += 0.1*(Math.random()-0.5);
		this.rotation.z += 0.1*(Math.random()-0.5);	
		this.position.copy(this.localToWorld(new THREE.Vector3(0, 0, -0.01)));
		game.scene.entityManager.animQueue.add(this);
	}

	var butterflyTextures = [];
	butterflyTextures['monarch'] = THREE.ImageUtils.loadTexture('images/butterflies/monarch.png')

	var onPickButterfly = function (intersection) {
		console.log(intersection);
	}

	return function (scene, type, wingspan) {
		THREE.Object3D.call(this);

		this.scene = scene;

		//var map = butterflyTextures[type] || (butterflyTextures[type] = THREE.ImageUtils.loadTexture('./images/butterflies/'+type+'.png'));
		var map = butterflyTextures[type];
		//console.log(map.image.width);
		var wingLPivot = new THREE.Object3D(), wingRPivot = new THREE.Object3D();

		// TODO: Avoid hardcoding width to height ratio (Maybe load all images beforehand and check their dimensions).
		var wingL = new THREE.Mesh(new THREE.PlaneGeometry(0.5*wingspan, (2.0/3.0)*wingspan), new THREE.MeshPhongMaterial({ map: map, side: THREE.DoubleSide, transparent: true, alphaTest: 0.1 }));
		wingL.position.x = -0.25*wingspan;
		wingL.scale.x = -1;
		wingLPivot.add(wingL);
		wingLPivot.rotation.x = -0.5*Math.PI;

		var wingR = new THREE.Mesh(new THREE.PlaneGeometry(0.5*wingspan, (2.0/3.0)*wingspan), new THREE.MeshPhongMaterial({ map: map, side: THREE.DoubleSide, transparent: true, alphaTest: 0.1 }));
		wingR.position.x = 0.25*wingspan;
		wingRPivot.add(wingR);
		wingRPivot.rotation.x = -0.5*Math.PI;

		this.add(wingLPivot);
		this.add(wingRPivot);

		var hitSphere = new THREE.Mesh(new THREE.SphereGeometry(0.75*wingspan, 8, 4), new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true }));
		hitSphere.visible = false;
		hitSphere.onPick = onPickButterfly;
		this.add(hitSphere);

		this.setWingAngle = setButterflyWingAngle;

		this.heading = new THREE.Vector3(0, 0, -1);

		this.animate = animateButterfly;
	};
})();

GAME.entities.bugs.Butterfly.prototype = Object.create(THREE.Object3D.prototype);

GAME.entities.bugs.Butterfly.prototype.onSpawn = function () {
	this.scene.entityManager.animQueue.add(this);
};