(function() {
	const TICK_INTERVAL_MS = 1000.0/60.0;

	GAME.game = this;
	var game = GAME.game;

	game.tickList = [];
	game.animList = [];

	function init() {
		Physijs.scripts.worker = './physics/physijs_worker.js';
		Physijs.scripts.ammo = './ammo.js';

		GAME.models.load(function() {
			GAME.world.buildSceneIsland(game);
			GAME.input.init(game.scene, game.player);

			game.renderer = new THREE.WebGLRenderer({ antialias: true });
			game.renderer.setSize(window.innerWidth, window.innerHeight);
			game.renderer.shadowMapEnabled = true;
			game.renderer.shadowMapSoft = true;
			game.renderer.sortObjects = false;

			GAME.gui.init();

			window.addEventListener('resize', function(){
				game.camera.aspect = window.innerWidth/window.innerHeight;
				game.camera.updateProjectionMatrix();
				game.renderer.setSize(window.innerWidth, window.innerHeight);
			}, false);

			document.getElementById('game').insertBefore(game.renderer.domElement, document.getElementById('overlay'));
			game.tickList.push(GAME.audio);

			setTimeout(tick, TICK_INTERVAL_MS);
			requestAnimationFrame(render);
		});
	}

	var tickClock = new THREE.Clock();

	function tick() {
		// FIXME: Chrome throttles the interval down to 1s on inactive tabs.
		setTimeout(tick, TICK_INTERVAL_MS);

		GAME.gui.statsTick.begin();
		var delta = tickClock.getDelta();
		for (var i = 0, size = game.tickList.length; i < size; i++)
			game.tickList[i].tick(delta, game);
		GAME.gui.statsTick.end();
	}

	var animClock = new THREE.Clock();

	function render() {
		requestAnimationFrame(render);

		GAME.gui.statsRender.begin();
		var delta = animClock.getDelta();
		TWEEN.update();
		for (var i = 0, size = game.animList.length; i < size; i++)
			game.animList[i].animate(delta, game);
		game.renderer.render(game.scene, game.camera);
		GAME.gui.statsRender.end();
	}

	this.main = function() {
		init();
	};
}).apply(GAME.namespace('core.Main'));