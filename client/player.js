// TODO: Release to the general public.

GAME.namespace('player').Player = function (scene) {
	THREE.Object3D.call(this);

	this.scene = scene;

	var bodyRig = this.bodyRig = new THREE.Object3D();
	bodyRig.position.y = -0.92;
	bodyRig.rotation.y = Math.PI;

	var bodyMesh = this.mesh = new THREE.SkinnedMesh(GAME.models.player.body.geom, new THREE.MeshFaceMaterial(GAME.models.player.body.mats));
	
	var mats = bodyMesh.material.materials;
	for (var i = 0,length = mats.length; i < length; i++) {
		var mat = mats[i];
		mat.skinning = true;
	}

	bodyRig.add(bodyMesh);

	for (var i = 0; i < bodyMesh.geometry.animation.length; i++)
		THREE.AnimationHandler.add(bodyMesh.geometry.animation[i]);
	
	this.animations = {
		pose: new THREE.Animation(bodyMesh, 'pose', THREE.AnimationHandler.CATMULLROM),
		idle: new THREE.Animation(bodyMesh, 'idle', THREE.AnimationHandler.CATMULLROM),
		walk: new THREE.Animation(bodyMesh, 'walk', THREE.AnimationHandler.CATMULLROM),
		chop: new THREE.Animation(bodyMesh, 'chop', THREE.AnimationHandler.CATMULLROM)
		// TODO: Run animation.
	};

	this.skeleton = new GAME.animation.Skeleton(bodyMesh);
	bodyRig.add(this.skeleton);

	var mesh = new THREE.Mesh(GAME.models.player.head.geom, new THREE.MeshFaceMaterial(GAME.models.player.head.mats));

	this.head = new THREE.Object3D();
	this.head.add(mesh);

	this.skeleton.boneMap.head.add(this.head);
	this.add(bodyRig);


	this.animation = this.animations.idle;
	this.animation.play();

	/*
	// TODO: Consider refactoring "state" to "transform" both client and server-side.
	this.states = new GAME.utils.Queue();
	*/

	this.despawned = false;
};

GAME.player.Player.prototype = Object.create(THREE.Object3D.prototype);

GAME.player.Player.prototype.playAnimation = function (name, loop, startTimeMS) {
	this.animation.stop();
	this.animation = this.animations[name];
	this.animation.play(loop, startTimeMS);
};

GAME.player.Player.prototype.onStateReceived = function (state) {
	/*
	state.timeStamp = new Date().getTime();
	this.states.add(state);
	// TODO: Make state queue size limit a constant.
	if (this.states.size > 20)
		this.states.poll();
	*/

	this.serverState = state;
};

GAME.player.Player.prototype.setHeldItem = function (itemName) {
	if (!itemName) {
		this.heldItem = null;
		this.axe.mesh.visible = false;
	} else if (itemName == 'axeItem') {
		this.heldItem = this.axe;
		this.axe.mesh.visible = true;
	}
};

GAME.player.Player.prototype.tick = function() {
	if (this.despawned) return;

	/* Linear interpolation/extrapolation between current and previous state. */

	var linearVelocity = new THREE.Vector3().copy(this.serverState.pos).sub(this.position);
	var dist = linearVelocity.length();
	if (dist < 0.01) {
		this.position.copy(this.serverState.pos);
	} else if (dist < 1) {
		this.position.add(linearVelocity.multiplyScalar(0.1));
	} else {
		this.position.add(linearVelocity.normalize().multiplyScalar(0.1));
	}
	
	var angularVelocity = new THREE.Vector3().copy(this.serverState.rot).sub(this.rotation);
	dist = angularVelocity.length();
	if (dist < 0.01) {
		this.rotation.copy(this.serverState.rot);
	} else {
		this.rotation.add(angularVelocity.multiplyScalar(0.1));
	}

	this.scene.entityManager.tickQueue.add(this);
};


// TODO: Restructure and use only Object3Ds.
GAME.player.PlayerController = function (scene, player, camera) {
	var self = this;

	player.collider = new Physijs.CapsuleMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8), new THREE.MeshBasicMaterial({ visible: false }));
	player.collider.position = player.position;
	player.collider._physijs.collision_flags = 16;
	scene.add(player.collider);
	player.collider.setAngularFactor(new THREE.Vector3());


	var camPivotY = new THREE.Object3D();
	camPivotY.rotation.y = Math.PI;
	player.skeleton.boneMap.head.add(camPivotY);

	var camPivotX = new THREE.Object3D();
	camPivotY.add(camPivotX);

	var camRig = this.camRig = new THREE.Object3D();
	player.mesh.visible = false;
	camPivotX.add(this.camRig);

	document.addEventListener('mousewheel', function (event) {
		if (!GAME.input.pointerLocked) return;

		self.camRig.position.z -= event.wheelDeltaY/120;

		self.camRig.position.z = self.camRig.position.z < 0 ? 0 : self.camRig.position.z > 10 ? 10 : self.camRig.position.z;

		player.mesh.visible = self.camRig.position.z > 0;
	});

	this.camRig.add(camera);

	var jumpSphere = player.jumpSphere = new Physijs.SphereMesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ visible: false }));
	jumpSphere.position.copy(player.collider.position);
	// TODO: Make player height an attribute of Player.
	jumpSphere.position.y -= 0.85;
	jumpSphere._physijs.collision_flags = 4;
	var landingSound;
	GAME.audio.load(['audio/landing.ogg'], function(source){landingSound = source;});
	jumpSphere.addEventListener('collision', function (other_object) {
		if (landingSound /*&& other_object instanceof Physijs.HeightfieldMesh*/)
			landingSound.play(false);
	});
	scene.add(jumpSphere);
	var consJump = new Physijs.DOFConstraint(
		player.collider,
		jumpSphere,
		new THREE.Vector3().copy(jumpSphere.position)
	);
	scene.addConstraint(consJump);


	var interactShape = player.interactShape = new Physijs.CylinderMesh(new THREE.CylinderGeometry(0.5, 0.5, 2), new THREE.MeshBasicMaterial({ visible: false }));
	interactShape.position.copy(player.collider.position);
	interactShape.position.z -= 1;
	interactShape._physijs.collision_flags = 4;
	scene.add(interactShape);
	// TODO: Remove filthy, filthy hackses.
	var fwd = new THREE.Vector3(0, 0, -1);
	scene.addEventListener('update', function () {
		player.interactShape.position.copy(player.localToWorld(new THREE.Vector3(0, 0.34, -0.8)));
		player.interactShape.__dirtyPosition = true;
	});


	// //player.collider.setDamping(0.99, 1.0);
	// var consPos = new Physijs.DOFConstraint(player.collider, new THREE.Vector3());
	// scene.addConstraint(consPos);
	// // TODO: Remove hardcoding.
	// //constraint.setLinearLowerLimit(new THREE.Vector3(-500, -20, -700));
	// //constraint.setLinearUpperLimit(new THREE.Vector3(500, 900, 300));
	// consPos.setLinearLowerLimit(new THREE.Vector3(-Infinity, -Infinity, -Infinity));
	// consPos.setLinearUpperLimit(new THREE.Vector3(Infinity, Infinity, Infinity));
	// consPos.setAngularLowerLimit(new THREE.Vector3());
	// consPos.setAngularUpperLimit(new THREE.Vector3());


	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var jump = false;
	var spacePressed = false;

	var velocity = new THREE.Vector3();//, prevVelocity = new THREE.Vector3();



	var mouseDeltaX = 0;
	var mouseDeltaY = 0;

	var PI_2 = Math.PI / 2;

	document.addEventListener('mousemove', function (event) {
		if (!GAME.input.pointerLocked) return;

		mouseDeltaX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		mouseDeltaY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;


		if (mouseDeltaX || mouseDeltaY) {
			// TODO: Do this immediately in the mousemove event handler for added smoothness.
			camPivotY.rotation.y -= mouseDeltaX * 0.002;
			camPivotX.rotation.x -= mouseDeltaY * 0.002;

			camPivotX.rotation.x = Math.max(-PI_2, Math.min(PI_2, camPivotX.rotation.x));

			if (self.camRig.position.z <= 0 || moveForward || moveBackward || moveLeft || moveRight) {
				player.rotation.y += camPivotY.rotation.y - Math.PI;
				camPivotY.rotation.y = Math.PI;
			}
		}
	}, false);

	document.addEventListener('keydown', function (event) {
		switch (event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true; break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if (!spacePressed && player.jumpSphere._physijs.touches.length > 1)
					jump = true;
				spacePressed = true;
				break;
			case 66:
				// TODO: Restructure.
				if (!GAME.input.pointerLocked) return;
				var ball = new Physijs.SphereMesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshPhongMaterial({ color: 0x0000FF }));
				var headWorldPos = camPivotX.localToWorld(new THREE.Vector3(0, 0, -1));
				ball.position.copy(headWorldPos);
				ball.castShadow = true;
				ball.receiveShadow = true;
				scene.add(ball);
				ball.setLinearVelocity(camPivotX.localToWorld(new THREE.Vector3(0, 0, -2)).sub(headWorldPos).normalize().multiplyScalar(20));
				break;
			case 86:
				self.camRig.add(GAME.game.camera);
				break;
		}
	}, false);

	document.addEventListener('keyup', function (event) {
		switch(event.keyCode) {
			case 38: // Up
			case 87: // W
				moveForward = false;
				break;
			case 37: // Left
			case 65: // A
				moveLeft = false;
				break;
			case 40: // Down
			case 83: // S
				moveBackward = false;
				break;
			case 39: // Right
			case 68: // D
				moveRight = false;
				break;
			case 32: // Space
				spacePressed = false;
				break;
		}
	}, false);



	var rayCasterPick = new THREE.Raycaster();
	document.addEventListener('mousedown', function (event) {
		if (GAME.input.pointerLocked && player.heldItem && 'onMousedown' in player.heldItem)
			player.heldItem.onMousedown(event);

		for (var i = 0, len = player.interactShape._physijs.touches.length; i < len; i++) {
			var interactee = scene._objects[player.interactShape._physijs.touches[i]];
			if ('onInteract' in interactee)
				interactee.onInteract.call(interactee);
		}

		var headPos = player.head.localToWorld(new THREE.Vector3());
		rayCasterPick.ray.origin = headPos;
		rayCasterPick.ray.direction.copy(player.head.localToWorld(new THREE.Vector3(0, 0, -1)).sub(headPos).normalize());
		// TODO: Consider testing only a subset of objects for intersetion.
		var intersections = rayCasterPick.intersectObject(scene, true);
		for (var i = 0, len = intersections.length; i < len; i++) {
			if (intersections[i].distance > 1.5)
				break;
			if (intersections[i].object.visible || 'onPick' in intersections[i].object) {
				var pickee = intersections[i].object;
				if ('onPick' in pickee)
					pickee.onPick.call(pickee, intersections[i]);
				break;
			}
		}
	}, false);

	document.addEventListener('mouseup', function (event) {
		if (GAME.input.pointerLocked && player.heldItem && 'onMouseup' in player.heldItem)
			player.heldItem.onMouseup(event);
	}, false);


	var netTimer = 0;

	this.update = function (delta) {
		// TODO: Make diagonal movement the same speed as vertical and horizontal by clamping small velocities to 0 and normalizing.

		if (!GAME.input.pointerLocked) return;

		delta *= 100;

		if (moveForward) velocity.z -= delta;
		if (moveBackward) velocity.z += delta;

		if (moveLeft) velocity.x -= delta;
		if (moveRight) velocity.x += delta;

		// TODO: Remove filthy hacks.
		var horiDamping = 1-delta*0.2;
		
		// TODO: Optimise.
		var inputV = camPivotY.localToWorld(velocity).sub(camPivotY.localToWorld(new THREE.Vector3()));
		var finalV = new THREE.Vector3().copy(player.collider.getLinearVelocity()).multiply(new THREE.Vector3(horiDamping, 1, horiDamping)).add(inputV);
		if (jump) {
			finalV.y = 4;
			jump = false;
		}
		player.collider.setLinearVelocity(finalV);


		var moving = moveForward || moveBackward || moveLeft || moveRight;

		if (self.camRig.position.z <= 0 || moving) {
			player.rotation.y += camPivotY.rotation.y - Math.PI;
			camPivotY.rotation.y = Math.PI;
		}

		if (moving) {
			if (player.state !== 'walk' || !player.animation.isPlaying)
				player.playAnimation('walk');
			player.state = 'walk';
		} else {
			if (player.state !== 'idle')
				player.playAnimation('idle');
			player.state = 'idle';
		}
		velocity.set(0,0,0);


		netTimer += delta;
		if (netTimer >= 1000) {
			GAME.net.p2p.send('state', { pos: player.position.toArray(), rot: player.rotation.toArray() });
			netTimer = 0;
		}
	};
};