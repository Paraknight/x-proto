GAME.namespace('physics').constants = {
	// NOTE: All values in SI units. Assuming room temperature (293.15K(20°C)).
	AIR_DENSITY: 1.204,
	WATER_DENSITY: 998.2,


	/* Drag Coefficients */
	CDs: {
		sphere: 0.47,
		CD_HEMISPHERE: 0.42,
		CD_CONE: 0.50,
		aabb: 1.05,
		CD_DIAMOND: 0.80,
		CD_LONGCYLINDER: 0.82,
		CD_SHORTCYLINDER: 1.15,
		CD_STREAMLINED: 0.04,
		CD_HEMISTREAMLINED: 0.09
	}
};

GAME.physics.AABB = function (center, width, height) {
	this.type = 'aabb';
	this.center = center;
	this.halfWidth = width/2;
	this.halfHeight = height/2;
	// TODO: Clean up.
	//this._geom = new THREE.CubeGeometry(width, height, width);
	this.min = new THREE.Vector3();
	this.max = new THREE.Vector3();
	this.verts = [];
	for (var i = 0; i < 8; i++)
		this.verts[i] = new THREE.Vector3();
	this._maxRadius = Math.sqrt(this.halfWidth*this.halfWidth + this.halfHeight*this.halfHeight);
	this._refArea = (this.halfWidth * this.halfHeight * 2) + (this.halfWidth * this.halfWidth * 2);
	this.updateBounds();
};

GAME.physics.AABB.prototype.updateBounds = function () {
	// TODO: Consider storing mins and maxs as vectors.
	this.min.set(this.center.x - this.halfWidth, this.center.y - this.halfHeight, this.center.z - this.halfWidth);
	this.max.set(this.center.x + this.halfWidth, this.center.y + this.halfHeight, this.center.z + this.halfWidth);
};

GAME.physics.AABB.prototype.updateVerts = function () {
	this.updateBounds();
	this.verts[0].set(this.min.x, this.min.y, this.min.z);
	this.verts[1].set(this.min.x, this.min.y, this.max.z);
	this.verts[2].set(this.min.x, this.max.y, this.min.z);
	this.verts[3].set(this.min.x, this.max.y, this.max.z);
	this.verts[4].set(this.max.x, this.min.y, this.min.z);
	this.verts[5].set(this.max.x, this.min.y, this.max.z);
	this.verts[6].set(this.max.x, this.max.y, this.min.z);
	this.verts[7].set(this.max.x, this.max.y, this.max.z);
};

GAME.physics.AABB.prototype.contains = function (point) {
	this.updateBounds();
	return (point.x >= this.min.x && point.x <= this.max.x) && (point.y >= this.min.y && point.y <= this.max.y) && (point.z >= this.min.z && point.z <= this.max.z);
};

GAME.physics.Sphere = function (center, radius) {
	this.type = 'sphere';
	this.center = center;
	this.radius = radius;
	this._refArea = Math.PI * radius * radius;
};

GAME.physics.Plane = function (normal, constant) {
	this.type = 'plane';
	this._plane = new THREE.Plane(normal, constant);
	//this.normal = normal;
};

// TODO: Consider allowing HeightFields that are offset from the center of the scene.
GAME.physics.HeightField = function (heightMap, scale) {
	// TODO: Take account of height field normals.
	this.type = 'heightField';
	this.heightMap = heightMap;
	this.scale = scale;
	this.maxHeight = 0;
	for (var x = 0, lenX = heightMap.length; x < lenX; x++)
		for (var z = 0, lenZ = heightMap[x].length; z < lenZ; z++)
			this.maxHeight = Math.max(heightMap[x][z], this.maxHeight);
};

GAME.physics.HeightField.prototype.calcHeightAt = function(x, z) {
	try {
		x = x/this.scale + 128;
		x = x<0?0:x>255?255:x;
		z = z/this.scale + 128;
		z = z<0?0:z>255?255:z;
		var xMap = x>>0, zMap = z>>0;
		return GAME.utils.noise.biLerp(this.heightMap[xMap][zMap], this.heightMap[xMap+1][zMap], this.heightMap[xMap][zMap+1], this.heightMap[xMap+1][zMap+1], x-xMap, z-zMap);
	} catch (e) {
		console.error('Attempted to access: heightMap['+xMap+']['+zMap+'] from ('+x+','+z+').');
	}
};


GAME.physics.Collider = function (colShape, mass, friction, restitution) {
	/**
	 * Collider: {
	 * colShape
	 * mass
	 // TODO: Consider making a velocity property optional.
	 * _velocity
	 * _prevVelocity
	 *
	 * }
	 */
	this.colShape = colShape;
	this.mass = mass || 0;
	this.friction = friction || 0;
	this.restitution = restitution || 0;
	this._force = new THREE.Vector3();
	this._acceleration = new THREE.Vector3();
	this._frictionAcc = 0;
	this._velocity = new THREE.Vector3();
};

GAME.physics.Collider.prototype.setLinearVelocity = function(velocity) {
	// TODO: Potentially redundant.
	this._velocity.copy(velocity);
};

GAME.physics.Collider.prototype.getLinearVelocity = function() {
	// TODO: Potentially redundant.
	return this._velocity;
};

GAME.physics.Collider.prototype.addForce = function (force) {
	// TODO: Potentially redundant.
	this._force.add(force);
};

// TODO: Consider outsourcing physics simulation to a web worker.
GAME.physics.Simulator = function (config) {
	config = config || {};
	this.gravity = config.gravity || new THREE.Vector3(0, -9.81, 0);

	this.entityList = new GAME.utils.List();
};

GAME.physics.Simulator.prototype.simulate = function (delta) {
	var deltaGrav = new THREE.Vector3().copy(this.gravity).multiplyScalar(delta);
	for (var node = this.entityList.head; node; node = node.next) {
		var collider = node.e.collider;
		if (collider.mass <= 0)
			continue;

		var currV = collider._velocity;

		// TODO: Velocity Verlet Integration.
		var acc = collider._acceleration.copy(collider._force).divideScalar(collider.mass).add(this.gravity).addScalar(collider._frictionAcc);
		var drag = new THREE.Vector3(currV.x*currV.x*currV.x/Math.abs(currV.x), currV.y*currV.y*currV.y/Math.abs(currV.y), currV.z*currV.z*currV.z/Math.abs(currV.z)).multiplyScalar((GAME.physics.constants.AIR_DENSITY * GAME.physics.constants.CDs[collider.colShape.type] * collider.colShape._refArea)/(-2*collider.mass));
		acc.add(drag);
		var nextV = new THREE.Vector3().addVectors(currV, new THREE.Vector3().copy(acc).multiplyScalar(delta));
		var deltaPos = new THREE.Vector3().copy(currV).add(nextV).multiplyScalar(delta/2);
		currV.copy(nextV);
		node.e.position.add(deltaPos);

		collider._force.set(0,0,0);
		collider._frictionAcc = 0;
	}

	// TODO: Implement broad-phase with octrees.
	for (var node1 = this.entityList.head; node1; node1 = node1.next) {
		for (var node2 = node1.next; node2; node2 = node2.next) {
			var entity1 = node1.e, entity2 = node2.e;
			// TODO: Coarse collision detection first.
			if (this.collideEntities(entity1, entity2)) {
				// TODO: Consider using event listeners instead of one fixed function.
				'onCollision' in entity1 && entity1.onCollision(entity2);
				'onCollision' in entity2 && entity2.onCollision(entity1);
			}
		}
	}
};

GAME.physics.Simulator.prototype.collideEntities = function (entity1, entity2) {
	var escVec = this.getEscVec(entity1.collider.colShape, entity2.collider.colShape);
	if(!escVec)
		return false;
	
	var m1 = entity1.collider.mass, m2 = entity2.collider.mass;

	// TODO: Attempt optimising this.
	if (m1 <= 0) {
		if (m2 <= 0)
			return true;

		entity2.position.add(escVec.negate());

		// TODO: Handle sphere elastic collisions properly.
		if (escVec.x) {
			entity2.collider._velocity.x *= -entity2.collider.restitution;
			entity2.collider._velocity.y *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
			entity2.collider._velocity.z *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
		} else if (escVec.y) {
			entity2.collider._velocity.y *= -entity2.collider.restitution;
			entity2.collider._velocity.x *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
			entity2.collider._velocity.z *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
		} else if (escVec.z) {
			entity2.collider._velocity.z *= -entity2.collider.restitution;
			entity2.collider._velocity.x *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
			entity2.collider._velocity.y *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
		}
	} else if (m2 <= 0) {
		entity1.position.add(escVec);
		
		// TODO: Handle sphere elastic collisions properly.
		if (escVec.x) {
			entity1.collider._velocity.x *= -entity1.collider.restitution;
			entity1.collider._velocity.y *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
			entity1.collider._velocity.z *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
		} else if (escVec.y) {
			entity1.collider._velocity.y *= -entity1.collider.restitution;
			entity1.collider._velocity.x *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
			entity1.collider._velocity.z *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
		} else if (escVec.z) {
			entity1.collider._velocity.z *= -entity1.collider.restitution;
			entity1.collider._velocity.x *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
			entity1.collider._velocity.y *= 1 - 0.5 * (entity1.collider.friction + entity2.collider.friction);
		}
	} else {
		var massRatio = m2/(m1+m2);
		entity1.position.add(new THREE.Vector3().copy(escVec).multiplyScalar(massRatio));
		entity2.position.add(escVec.multiplyScalar(massRatio-1));

		var u1 = entity1.collider._velocity, u2 = entity2.collider._velocity;

		var m1u1 = new THREE.Vector3().copy(u1).multiplyScalar(m1), m2u2 = new THREE.Vector3().copy(u2).multiplyScalar(m2);

		// TODO: Think more about the implications of collider-specific coefficients of restitution.
		var v1 = new THREE.Vector3().subVectors(u2, u1).multiplyScalar(entity1.collider.restitution * m2).add(m1u1).add(m2u2).divideScalar(m1+m2);
		var v2 = new THREE.Vector3().subVectors(u1, u2).multiplyScalar(entity2.collider.restitution * m1).add(m2u2).add(m1u1).divideScalar(m2+m1);

		u1.copy(new THREE.Vector3().copy(v1).projectOnVector(escVec).multiplyScalar(2).sub(v1));
		u2.copy(new THREE.Vector3().copy(v2).projectOnVector(escVec).multiplyScalar(2).sub(v2));
	}

	/*
	if (velocity1.x < 0.01 && velocity1.y < 0.01 && velocity1.z < 0.01)
		velocity1.set(0,0,0);
	if (velocity2.x < 0.01 && velocity2.y < 0.01 && velocity2.z < 0.01)
		velocity2.set(0,0,0);
	*/
	return true;
};

GAME.physics.Simulator.prototype.getEscVec = function (colShape1, colShape2) {
	switch (colShape1.type+colShape2.type) {
	case 'aabbaabb':
		// TODO: Use THREE's Box3.
		var aabb1 = colShape1, aabb2 = colShape2;

		//if ()

		aabb1.updateBounds();
		aabb2.updateBounds();


		// TODO: There must be a better way to do this. Implement it.

		if ((aabb1.min.x >= aabb2.max.x)||(aabb1.max.x <= aabb2.min.x))
			return null;

		var temp;

		var escX = 0;
		if (aabb1.max.x >= aabb2.max.x) {
			escX = aabb2.max.x - aabb1.min.x;
			if (aabb1.min.x <= aabb2.min.x) {
				temp = aabb2.min.x - aabb1.max.x;
				escX = (Math.abs(escX) <= Math.abs(temp))?escX:temp;
			}
		} else {
			escX = aabb2.min.x - aabb1.max.x;
			if (aabb2.min.x <= aabb1.min.x) {
				temp = aabb1.min.x - aabb2.max.x;
				escX = (Math.abs(escX) <= Math.abs(temp))?escX:temp;
			}
		}


		if ((aabb1.min.z >= aabb2.max.z)||(aabb1.max.z <= aabb2.min.z))
			return null;

		var escZ = 0;
		if (aabb1.max.z >= aabb2.max.z) {
			escZ = aabb2.max.z - aabb1.min.z;
			if (aabb1.min.z <= aabb2.min.z) {
				temp = aabb2.min.z - aabb1.max.z;
				escZ = (Math.abs(escZ) <= Math.abs(temp))?escZ:temp;
			}
		} else {
			escZ = aabb2.min.z - aabb1.max.z;
			if (aabb2.min.z <= aabb1.min.z) {
				temp = aabb1.min.z - aabb2.max.z;
				escZ = (Math.abs(escZ) <= Math.abs(temp))?escZ:temp;
			}
		}


		if ((aabb1.min.y >= aabb2.max.y)||(aabb1.max.y <= aabb2.min.y))
			return null;

		var escY = 0;
		if (aabb1.max.y >= aabb2.max.y) {
			escY = aabb2.max.y - aabb1.min.y;
			if (aabb1.min.y <= aabb2.min.y) {
				temp = aabb2.min.y - aabb1.max.y;
				escY = (Math.abs(escY) <= Math.abs(temp))?escY:temp;
			}
		} else {
			escY = aabb2.min.y - aabb1.max.y;
			if (aabb2.min.y <= aabb1.min.y) {
				temp = aabb1.min.y - aabb2.max.y;
				escY = (Math.abs(escY) <= Math.abs(temp))?escY:temp;
			}
		}
		

		// TODO: Create entity property or method for step height.
		var escVec = new THREE.Vector3();
		var absEscX = Math.abs(escX), absEscY = Math.abs(escY), absEscZ = Math.abs(escZ);
		if((absEscX < absEscY) && (absEscX < absEscZ)) {
			escVec.x = escX;
		} else if((absEscZ < absEscX) && (absEscZ < absEscY)) {
			escVec.z = escZ;
		} else {
			escVec.y = escY;
		}
		return escVec;
	case 'spheresphere':
		var sphere1 = colShape1, sphere2 = colShape2;
		var treshDist = sphere1.radius + sphere2.radius;
		
		if ((((sphere1.center.x - sphere2.center.x)>>0) >= treshDist)
				|| (((sphere1.center.y - sphere2.center.y)>>0) >= treshDist)
				|| (((sphere1.center.z - sphere2.center.z)>>0) >= treshDist))
			return null;

		var dist = sphere1.center.distanceTo(sphere2.center)-treshDist;
		if (dist >= 0)
			return null;

		return new THREE.Vector3().subVectors(sphere2.center, sphere1.center).normalize().multiplyScalar(dist);
	case 'aabbsphere':
		var scale = -1;
		var aabb = colShape1, sphere = colShape2;
	case 'sphereaabb':
		var scale = scale || 1;
		var aabb = aabb || colShape2,  sphere = sphere || colShape1;

		// TODO: Consider testing against sphere bounding box rather than aabb bounding sphere.
		var treshDist = aabb._maxRadius + sphere.radius;
		
		if ((((aabb.center.x - sphere.center.x)>>0) >= treshDist)
				|| (((aabb.center.y - sphere.center.y)>>0) >= treshDist)
				|| (((aabb.center.z - sphere.center.z)>>0) >= treshDist))
			return null;

		var closestPoint = new THREE.Vector3().copy(sphere.center).clamp(aabb.min, aabb.max);

		var dist = closestPoint.distanceTo(sphere.center)-sphere.radius;

		if (dist >= 0 && !closestPoint.equals(sphere.center))
			return null;

		aabb.updateBounds();

		if (closestPoint.equals(sphere.center)) {
			var escVec = new THREE.Vector3();

			var escX = (aabb.max.x - sphere.center.x < sphere.center.x - aabb.min.x) ? (aabb.max.x - sphere.center.x + sphere.radius) : (aabb.min.x - sphere.center.x - sphere.radius);
			var escY = (aabb.max.y - sphere.center.y < sphere.center.y - aabb.min.y) ? (aabb.max.y - sphere.center.y + sphere.radius) : (aabb.min.y - sphere.center.y - sphere.radius);
			var escZ = (aabb.max.z - sphere.center.z < sphere.center.z - aabb.min.z) ? (aabb.max.z - sphere.center.z + sphere.radius) : (aabb.min.z - sphere.center.z - sphere.radius);

			var absEscX = Math.abs(escX), absEscY = Math.abs(escY), absEscZ = Math.abs(escZ);
			if((absEscX < absEscY) && (absEscX < absEscZ)) {
				escVec.x = escX*scale;
			} else if((absEscZ < absEscX) && (absEscZ < absEscY)) {
				escVec.z = escZ*scale;
			} else {
				escVec.y = escY*scale;
			}
			return escVec;
		}

		return new THREE.Vector3().subVectors(sphere.center, closestPoint).normalize().multiplyScalar(-dist*scale);
	case 'aabbplane':
		var scale = -1;
		var aabb = colShape1, plane = colShape2;
	case 'planeaabb':
		var scale = scale || 1;
		var aabb = aabb || colShape2,  plane = plane || colShape1;
		
		if (plane._plane.distanceToPoint(aabb.center) >= aabb._maxRadius)
			return null;

		aabb.updateVerts();
		var deepestPointDist = 0, deepestPoint;
		for (var i = 0, len = aabb.verts.length; i < len; i++) {
			var point = aabb.verts[i];
			var dist = plane._plane.distanceToPoint(point);
			if (dist >= 0)
				continue;

			if (dist < deepestPointDist) {
				deepestPointDist = dist;
				deepestPoint = point;
			}
		}
		if (!deepestPoint)
			return null;

		return new THREE.Vector3().copy(plane._plane.normal).multiplyScalar(deepestPointDist*scale);
	case 'sphereplane':
		var scale = -1;
		var sphere = colShape1, plane = colShape2;
	case 'planesphere':
		var scale = scale || 1;
		var sphere = sphere || colShape2,  plane = plane || colShape1;
		
		var dist = plane._plane.distanceToPoint(sphere.center) - sphere.radius;

		if (dist >= 0)
			return null;

		return new THREE.Vector3().copy(plane._plane.normal).multiplyScalar(dist*scale);
	// TODO: Take account of heightfield normals.
	case 'aabbheightField':
		var scale = 1;
		var aabb = colShape1, heightField = colShape2;
	case 'heightFieldaabb':
		var scale = scale || -1;
		var aabb = aabb || colShape2,  heightField = heightField || colShape1;

		var aabbMinY = aabb.center.y - aabb.halfHeight;

		if (aabbMinY >= heightField.maxHeight)
			return null;

		var groundHeight = heightField.calcHeightAt(aabb.center.x, aabb.center.z);

		if (aabbMinY >= groundHeight)
			return null;

		return new THREE.Vector3(0, (groundHeight-aabbMinY)*scale, 0);
	case 'sphereheightField':
		var scale = 1;
		var sphere = colShape1, heightField = colShape2;
	case 'heightFieldsphere':
		var scale = scale || -1;
		var sphere = sphere || colShape2,  heightField = heightField || colShape1;

		var sphereMinY = sphere.center.y - sphere.radius;

		if (sphereMinY >= heightField.maxHeight)
			return null;

		var groundHeight = heightField.calcHeightAt(sphere.center.x, sphere.center.z);

		if (sphereMinY >= groundHeight)
			return null;

		return new THREE.Vector3(0, (groundHeight-sphereMinY)*scale, 0);
	default:
		break;
	}
};