GAME.namespace('entities.terrain').TerrainIsland = function (scene, seed) {
	THREE.Object3D.call(this);

	//this.seed = seed;

	var game = GAME.game;


	var water = new THREE.Mesh(new THREE.PlaneGeometry(20480, 20480), new THREE.MeshPhongMaterial({ color: 0x1C6BA0/*, opacity: 0.5*/ }));
	water.lookAt(new THREE.Vector3(0,1,0));
	water.position.y = 1.0;
	//this.add(water);

	game.setLoadingText('Generating terrain...');
	var heightMap = this.heightMap = [], row, x, xWorld, z, zWorld, fade, perlin2D = GAME.utils.noise.perlin2D;
	for (x = 0, xWorld = -128; x <= 256; x++, xWorld++) {
		row = heightMap[x] = [];
		for (z = 0, zWorld = -128; z <= 256; z++, zWorld++) {
			fade = Math.max(1-((xWorld*xWorld+zWorld*zWorld)/16384), 0);
			row[z] = ((perlin2D(seed, x, z)+1)/2) * fade * 64;
		}
	}
	game.setLoadingText('Building terrain...');
	var terrainGeom = new THREE.PlaneGeometry(1024, 1024, 256, 256);
	for (var i = 0; i < terrainGeom.vertices.length; i++) {
		var vertex = terrainGeom.vertices[i];
		vertex.z = heightMap[(-vertex.y/4)+128][(-vertex.x/4)+128];
	}
	terrainGeom.computeFaceNormals();
	terrainGeom.computeVertexNormals();

	var terrainMat = new THREE.ShaderMaterial(GAME.shaders.terrain);
	terrainMat.fog = true;
	terrainMat.lights = true;
	terrain = new Physijs.HeightfieldMesh(terrainGeom, terrainMat, 0);
	terrain.lookAt(new THREE.Vector3(0,1,0));
	terrain.receiveShadow = true;
	//console.log('Done.');

	scene.add(terrain);
};

GAME.entities.terrain.TerrainIsland.prototype = Object.create(THREE.Object3D.prototype);