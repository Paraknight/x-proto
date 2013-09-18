GAME.namespace('entities.flora').Tree = (function () {
	var game = GAME.game;

	var treeGeom = GAME.models.tree.tree.geom, timberGeom = GAME.models.tree.timber.geom, stumpGeom = GAME.models.tree.stump.geom;
	var treeMats = GAME.models.tree.tree.mats;

	var treeChopSound, treeFellSound;
	GAME.audio.load(['audio/chop.ogg'], function(source){treeChopSound = source;});
	GAME.audio.load(['audio/treefell.ogg'], function(source){treeFellSound = source;});

	function onInteract (intersection) {
		if (game.player.heldItem !== game.player.axe) return;

		if (treeChopSound) {
			treeChopSound.setPosition(this.position);
			treeChopSound.play(false);
		}
		if (++this.chopCount < 4)
			return;

		game.scene.remove(this);
		var stumpCollider = new Physijs.CylinderMesh(new THREE.CylinderGeometry(0.9, 0.9, 0.72), new THREE.MeshBasicMaterial(/*{ color: 0x00EE00, wireframe: true }*/), 0);
		stumpCollider.visible = false;
		stumpCollider.position.copy(this.position);
		stumpCollider.position.y -= 1.64;
		stumpCollider.rotation.copy(this.rotation);
		var stumpMesh = new THREE.Mesh(stumpGeom, new THREE.MeshFaceMaterial(treeMats));
		stumpMesh.position.y -= 0.36;
		stumpMesh.castShadow = true;
		stumpMesh.receiveShadow = true;
		stumpCollider.add(stumpMesh);
		game.scene.add(stumpCollider);
		var timberCollider = new Physijs.CapsuleMesh(new THREE.CylinderGeometry(0.75, 0.75, 3.28), new THREE.MeshBasicMaterial(/*{ color: 0x00EE00, wireframe: true }*/));
		timberCollider.visible = false;
		timberCollider.position.copy(this.position);
		timberCollider.position.y += 0.36;
		timberCollider.rotation.copy(this.rotation);
		var timberMesh = new THREE.Mesh(timberGeom, new THREE.MeshFaceMaterial(treeMats));
		timberMesh.position.y -= 2.36;
		timberMesh.castShadow = true;
		timberMesh.receiveShadow = true;
		timberCollider.add(timberMesh);
		game.scene.add(timberCollider);
		// TODO: Consider making the timber tip to the left instead of forwards.
		timberCollider.applyCentralImpulse(new THREE.Vector3().subVectors(this.position, game.player.position).normalize());
		if (treeFellSound) {
			treeFellSound.setPosition(timberCollider.position);
			treeFellSound.play(false);
		}
	};

	return function (scene) {
		Physijs.CylinderMesh.call(this, new THREE.CylinderGeometry(0.75, 0.75, 4.0), new THREE.MeshBasicMaterial({ visible: false }), 0);
		this.chopCount = 0;
		this.onInteract = onInteract;
		// TODO: Consider ignoring colliders when picking.
		var treeMesh = new THREE.Mesh(treeGeom, new THREE.MeshFaceMaterial(treeMats));
		treeMesh.position.y -= 2.0;
		treeMesh.castShadow = true;
		treeMesh.receiveShadow = true;
		treeMesh.collider = this;
		this.add(treeMesh);
	};
})();

GAME.entities.flora.Tree.prototype = Object.create(Physijs.CylinderMesh.prototype);