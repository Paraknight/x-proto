GAME.namespace('entities.tools').Axe = function (scene) {
	THREE.Object3D.call(this);

	this.scene = scene;
	// TODO: Create proper tool models on which depthTest can be safely disabled.
	//for (var i = 0, len = GAME.models.tools.axe.mats.length; i < len; i++)
	//	GAME.models.tools.axe.mats[i].depthTest = false;
	this.mesh = new THREE.Mesh(GAME.models.tools.axe.geom, new THREE.MeshFaceMaterial(GAME.models.tools.axe.mats));
	this.mesh.scale.set(0.5,0.5,0.5);
	this.add(this.mesh);
};

GAME.entities.tools.Axe.prototype = Object.create(THREE.Object3D.prototype);

GAME.entities.tools.Axe.prototype.setOwner = function (player) {
	this.position.set(0.0,-player.head.position.y,-0.25);
	this.rotation.set(0,-0.25*Math.PI,0.1*Math.PI);
	player.head.add(this);
	// TODO: Implement correctly.
	player.axe = this;
	player.heldItem = this;
};

GAME.entities.tools.Axe.prototype.animate = function (delta) {
	if (this.rotation.y > -0.25*Math.PI) {
		this.rotation.y -= 6.0*delta;
		this.scene.entityManager.animQueue.add(this);
	} else {
		this.isRetracting = false;
	}
};

GAME.entities.tools.Axe.prototype.onMousedown = function (event) {
	this.rotation.y = 0;
	if (!this.isRetracting) {
		this.isRetracting = true;
		this.scene.entityManager.animQueue.add(this);
	}
};

//GAME.entities.tools.Axe.prototype.onMouseup = function (event) {};