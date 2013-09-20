GAME.namespace('entities.tools').Axe = function (scene) {
	THREE.Object3D.call(this);

	this.scene = scene;
	// TODO: Create proper tool models on which depthTest can be safely disabled.
	//for (var i = 0, len = GAME.models.tools.axe.mats.length; i < len; i++)
	//	GAME.models.tools.axe.mats[i].depthTest = false;
	this.mesh = new THREE.Mesh(GAME.models.tools.axe.geom, new THREE.MeshFaceMaterial(GAME.models.tools.axe.mats));
	this.scale.multiplyScalar(0.25);
	this.add(this.mesh);

	this.lastChopTime = Date.now();
};

GAME.entities.tools.Axe.prototype = Object.create(THREE.Object3D.prototype);

GAME.entities.tools.Axe.prototype.createItem = function () {
	return new GAME.gui.Item('res/textures/spritesheet.png', '40px', '0px', GAME.entities.tools.Axe);
};

GAME.entities.tools.Axe.prototype.setOwner = function (player) {
	//this.rotation.set(0,-0.25*Math.PI,0.1*Math.PI);
	
	this.player = player;

	this.position.y -= 0.01;
	this.position.z -= 0.1;
	this.rotation.x -= Math.PI;
	player.skeleton.boneMap.handR.add(this);
	player.heldItem = this;

	return this;
};

GAME.entities.tools.Axe.prototype.resetOwner = function () {
	this.player.heldItem = null;
	this.player.skeleton.boneMap.handR.remove(this);

	this.position.set(0, 0, 0);
	this.rotation.set(0, 0, 0);

	this.player = null;

	return this;
};

GAME.entities.tools.Axe.prototype.onMousedown = function (event) {
	//(this.canChop = (this.player.animation.data.name !== 'chop' || !this.player.animation.isPlaying) || this.player.playAnimation('chop', false);

	if (!(this.canChop = !(this.player.state === 'walk' || Date.now() - this.lastChopTime < 400))) return;

	this.lastChopTime = Date.now();
	this.player.playAnimation('chop', false);
};

//GAME.entities.tools.Axe.prototype.onMouseup = function (event) {};