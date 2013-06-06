GAME.namespace('models').load = function(callback) {
	var paths = ['tools.axe', 'tree.tree', 'tree.timber', 'tree.stump', 'portalradio.portalradio', 'player.torso', 'player.head'];

	var loaded = 0;

	function onModelLoaded() {
		if (++loaded >= paths.length)
			callback();
	}

	var loaderJSON = new THREE.JSONLoader();

	function loadModel (path) {
		loaderJSON.load('models/'+path.replace('.','/')+'.js', function (geometry, materials) {
			GAME.namespace('models.'+path).geom = geometry;
			GAME.namespace('models.'+path).mats = materials;
			onModelLoaded();
		});
	}

	for (var i = 0, len = paths.length; i < len; i++)
		loadModel(paths[i]);
};