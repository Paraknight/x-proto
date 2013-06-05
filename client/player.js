// TODO: Release to the general public.

GAME.namespace('player').Player = function (scene) {
	THREE.Object3D.call(this);

	this.scene = scene;

	this.head = new THREE.Object3D();
	this.head.position.y = 0.75;
	this.add(this.head);

	/*
	// TODO: Consider refactoring "state" to "transform" both client and server-side.
	this.states = new GAME.utils.Queue();
	*/

	this.despawned = false;
};

GAME.player.Player.prototype = Object.create(THREE.Object3D.prototype);

// TODO: Restructure.
GAME.player.Player.prototype.addModel = function() {
	var player = this;

	var torsoMesh = new Physijs.Mesh(GAME.models.player.torso.geom, new THREE.MeshFaceMaterial(GAME.models.player.torso.mats));
	torsoMesh.lookAt(new THREE.Vector3(0,0,-1));
	player.add(torsoMesh);

	var headMesh = new Physijs.Mesh(GAME.models.player.head.geom, new THREE.MeshFaceMaterial(GAME.models.player.head.mats));
	headMesh.lookAt(new THREE.Vector3(0,0,-1));
	player.head.add(headMesh);

	return this;
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
		this.head.remove(this.axeMesh);
	} else if (itemName == 'axeItem') {
		this.heldItem = this.axeMesh;
		this.head.add(this.axeMesh);
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


/**
 * @author mrdoob / http://mrdoob.com/
 * Modified by Paraknight 2013-03-26.
 */

// TODO: Restructure and use only Object3Ds.
GAME.player.PlayerController = function (scene, player) {
	player.collider = new Physijs.CapsuleMesh(new THREE.CylinderGeometry(0.3, 0.3, 1.8), new THREE.MeshBasicMaterial());
	player.collider.visible = false;
	player.collider.position = player.position;
	var landingSound;
	GAME.audio.load(['audio/landing.ogg'], function(source){landingSound = source;});
	/*
	player.collider.addEventListener('collision', function(other_object, relative_velocity, relative_rotation) {
		if (landingSound && other_object instanceof Physijs.HeightfieldMesh) {
			landingSound.setPosition(new THREE.Vector3().addVectors(player.position, new THREE.Vector3(0, -1.65, 0)));
			landingSound.play(false);
		}
	});
	*/
	scene.add(player.collider);

	//player.collider.setDamping(0.99, 1.0);
	var constraint = new Physijs.DOFConstraint(player.collider, new THREE.Vector3());
	scene.addConstraint(constraint);
	// TODO: Remove hardcoding.
	//constraint.setLinearLowerLimit(new THREE.Vector3(-500, -20, -700));
	//constraint.setLinearUpperLimit(new THREE.Vector3(500, 900, 300));
	constraint.setLinearLowerLimit(new THREE.Vector3(-Infinity, -Infinity, -Infinity));
	constraint.setLinearUpperLimit(new THREE.Vector3(Infinity, Infinity, Infinity));
	constraint.setAngularLowerLimit(new THREE.Vector3());
	constraint.setAngularUpperLimit(new THREE.Vector3());

	var scope = this;

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	document.addEventListener('mousemove', function (event) {
		if (scope.enabled === false) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		player.rotation.y -= movementX * 0.002;
		player.head.rotation.x -= movementY * 0.002;

		player.head.rotation.x = Math.max(-PI_2, Math.min(PI_2, player.head.rotation.x));
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
				// TODO: Make player height an attribute of Player.
				// TODO: Find another way to check if the player is touching the ground.
				if (scope.enabled && distToGround() < 1.33) velocity.y = 4;
				break;
			case 66:
				// TODO: Restructure.
				if (!scope.enabled) return;
				var ball = new Physijs.SphereMesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshPhongMaterial({ color: 0x0000FF }));
				var headWorldPos = player.head.localToWorld(new THREE.Vector3(0, 0, -1));
				ball.position.copy(headWorldPos);
				ball.castShadow = true;
				ball.receiveShadow = true;
				scene.add(ball);
				ball.setLinearVelocity(player.head.localToWorld(new THREE.Vector3(0, 0, -2)).sub(headWorldPos).normalize().multiplyScalar(20));
			break;
		}
	}, false);

	document.addEventListener('keyup', function (event) {
		switch(event.keyCode) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // a
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	}, false);

	var rayCasterPick = new THREE.Raycaster();
	document.addEventListener('mousedown', function (event) {
		if (scope.enabled && player.heldItem && 'onMousedown' in player.heldItem)
			player.heldItem.onMousedown(event);

		var headPos = player.head.localToWorld(new THREE.Vector3());
		rayCasterPick.ray.origin = headPos;
		rayCasterPick.ray.direction.copy(player.head.localToWorld(new THREE.Vector3(0, 0, -1)).sub(headPos).normalize());
		// TODO: Consider testing only a subset of objects for intersetion.
		var intersections = rayCasterPick.intersectObject(scene, true);
		for (var i = 0, len = intersections.length; i < len; i++) {
			if (intersections[i].distance > 1.5)
				break;
			if (intersections[i].object.visible || 'onPick' in intersections[i].object) {
				if ('onPick' in intersections[i].object)
					intersections[i].object.onPick(intersections[i]);
				break;
			}
		}
	}, false);

	document.addEventListener('mouseup', function (event) {
		if (scope.enabled && player.heldItem && 'onMouseup' in player.heldItem)
			player.heldItem.onMouseup(event);
	}, false);

	this.enabled = false;

	var rayCasterGround = new THREE.Raycaster();
	rayCasterGround.ray.origin = player.position;
	rayCasterGround.ray.direction.set(0, -1, 0);

	// TODO: Consider adding this function to the Player prototype.
	function distToGround() {
		var intersections = rayCasterGround.intersectObject(scene, true);
		return intersections.length>0 ? intersections[0].distance : -1;
	}

	//var netTimer = 0;

	this.update = function (delta) {
		//netTimer += delta;
		//if (netTimer >= 1) {
			GAME.net.p2p.send('state', { pos: player.position.toArray(), rot: player.rotation.toArray() });
		//	netTimer = 0;
		//}


		// TODO: Make diagonal movement the same speed as vertical and horizontal by clamping small velocities to 0 and normalizing.

		if (!scope.enabled) return;

		delta *= 100;

		if (moveForward) velocity.z = -delta;
		if (moveBackward) velocity.z = delta;

		if (moveLeft) velocity.x = -delta;
		if (moveRight) velocity.x = delta;

		//player.localToWorld(velocity).sub(player.position).length() < 0.01 ? velocity.set(0,0,0) : velocity.normalize().multiplyScalar(10);

		//if (moveForward || moveBackward || moveLeft || moveRight || velocity.y == 10) 
		
		var horiDamping = 1-delta*0.2;
		player.collider.setLinearVelocity(new THREE.Vector3().copy(player.collider.getLinearVelocity()).multiply(new THREE.Vector3(horiDamping, 1, horiDamping)).add(player.localToWorld(velocity).sub(player.position)));

		velocity.set(0,0,0);
	};

};