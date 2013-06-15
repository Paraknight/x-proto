GAME.namespace('models').load = function(models, callback) {
	if (models === undefined || models.length < 1) {
		callback();
		return;
	}

	var countdown = new GAME.utils.Countdown(models.length, callback);

	var loaderJSON = new THREE.JSONLoader();

	function loadModel (path) {
		loaderJSON.load('models/'+path.replace('.','/')+'.js', function (geometry, materials) {
			GAME.namespace('models.'+path).geom = geometry;
			GAME.namespace('models.'+path).mats = materials;
			countdown.dec();
		});
	}

	for (var i = 0, len = models.length; i < len; i++)
		loadModel(models[i]);
};