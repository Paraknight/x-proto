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
	//this.rotation.set(0,-0.25*Math.PI,0.1*Math.PI);
	this.position.y -= 0.01;
	this.position.z -= 0.1;
	this.rotation.x -= Math.PI;
	this.scale.multiplyScalar(0.5);
	player.skeleton.boneMap.handR.add(this);
	// TODO: Implement correctly.
	player.axe = this;
	player.heldItem = this;
};