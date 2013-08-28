GAME.namespace('physics').buildCollider = (function () {
	var colliderFactory = {
		box: function (width, height, depth, mass, friction, restitution) {
			return new Physijs.BoxMesh(new THREE.CubeGeometry(width, height, depth), Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true, visible: false }), friction, restitution), mass);
		},
		sphere: function (radius, widthSegments, heightSegments, mass, friction, restitution) {
			return new Physijs.SphereMesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true, visible: false }), friction, restitution), mass);
		},
		heightField: function (heightMap, scale, mass, friction, restitution) {
			return new Physijs.HeightfieldMesh(this.geometry, Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0x00EE00, wireframe: true, transparent: true, visible: false }), friction, restitution), mass);
		},
	};

	return function () {
		/*
		 * Arguments: entity, colShape, params
		 */
		 // TODO: This is super nasty.

		if (!(arguments[1] in colliderFactory)) {
			console.error('Invalid collider shape: \''+arguments[1]+'\'.');
			return;
		}


		var entity = arguments[0];
		var collider = colliderFactory[arguments[1]].apply(entity, Array.prototype.slice.call(arguments, 2));
		collider.position = entity.position;
		collider.rotation = entity.rotation;
		GAME.game.scene.add(collider);
		return collider;
	};
})();

// TODO: Consider outsourcing physics simulation to a web worker.
GAME.physics.Simulator = function (scene, config) {
	config = config || {};
	this.scene = scene;
	//this.gravity = config.gravity || new THREE.Vector3(0, -9.81, 0);
};

GAME.physics.Simulator.prototype.add = function (entity) {
	this.scene.add(entity.collider);
};

GAME.physics.Simulator.prototype.simulate = function (delta) {
	this.scene.simulate(delta);
};

GAME.physics.Simulator.prototype.remove = function (entity) {
	this.scene.remove(entity.collider);
};