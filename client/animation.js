GAME.namespace('animation').Skeleton = function (mesh) {
	if (!mesh.hasOwnProperty('bones') || !mesh.bones || !mesh.bones.length) throw new Error('Invalid argument; mesh has no bones.');

	THREE.Object3D.call(this);

	var boneMap = this.boneMap = {};

	function addBones (root) {
		var bone = new THREE.Object3D();
		bone.name = root.name;
		bone.position = root.position;
		bone.quaternion = root.quaternion;
		bone.scale = root.scale;
		//bone.add(new THREE.Mesh(new THREE.SphereGeometry(0.01), new THREE.MeshBasicMaterial()));
		this.add(bone);

		// NOTE: If a skeleton contains two bones with the same name, this implementation will cause the first to be overwritten by the second.
		boneMap[bone.name] = bone;

		for (var i = 0, len = root.children.length; i < len; i++)
			addBones.call(bone, root.children[i]);
	}

	for (var i = 0, len = mesh.bones.length; i < len; i++)
		if (!(mesh.bones[i].parent instanceof THREE.Bone))
			addBones.call(this, mesh.bones[i]);
};

GAME.animation.Skeleton.prototype = Object.create(THREE.Object3D.prototype);