GAME.entities.misc.Trigger = function (width, height, depth, onCollision) {
	Physijs.BoxMesh.call(this, new THREE.CubeGeometry(width, height, depth), new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true }), 0);
	this._physijs.collision_flags = 4;
	this.addEventListener('collision', onCollision);
};

GAME.entities.misc.Trigger.prototype = Object.create(Physijs.BoxMesh.prototype);