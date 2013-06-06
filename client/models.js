GAME.namespace('models').load = function(callback) {
	var paths = ['tools.axe', 'tree.tree', 'tree.timber', 'tree.stump', 'portalradio.portalradio', 'player.torso', 'player.head'];

	var countdown = new GAME.utils.Countdown(paths.length, callback);

	var loaderJSON = new THREE.JSONLoader();

	function loadModel (path) {
		loaderJSON.load('models/'+path.replace('.','/')+'.js', function (geometry, materials) {
			GAME.namespace('models.'+path).geom = geometry;
			GAME.namespace('models.'+path).mats = materials;
			countdown.dec();
		});
	}

	for (var i = 0, len = paths.length; i < len; i++)
		loadModel(paths[i]);
};