(function() {
	var TICK_INTERVAL_MS = 1000.0/60.0;

	var game = GAME.game = this;

	game.joinScene = function (name, onJoin) {
		var loadingScreen = document.getElementById('loadingScreen');
		loadingScreen.style.display = '';
		GAME.gui.setLoadingText('Loading Scene...');
		game.scene = new GAME.world.Scene(game, name, function () {
			loadingScreen.style.display = 'none';
			onJoin();
		});
		
	};

	function init() {
		Physijs.scripts.worker = './lib/physics/physijs_worker.js';
		Physijs.scripts.ammo = './ammo.js';

		/*
		var worker = new Worker('./worker.js');
		worker.onmessage = function (event) {
			document.getElementById('result').textContent = event.data;
		};
		worker.postMessage();
		*/

		//game.setLoadingText('Building Scene...');

		//game.setLoadingText('Initialising Controls...');
		GAME.input.init();

		//game.setLoadingText('Constructing Visuals...');
		
		GAME.graphics.init(game);



		window.addEventListener('focus', function(event) {
		}, false);

		window.addEventListener('blur', function(event) {
			game.isPaused = true;
		}, false);

		game.joinScene('island', function () {
			setTimeout(tick, TICK_INTERVAL_MS);
			requestAnimationFrame(render);
		});
	}

	var tickClock = new THREE.Clock();

	function tick() {
		// FIXME: Chrome throttles the interval down to 1s on inactive tabs.
		setTimeout(tick, TICK_INTERVAL_MS);

		if (game.isPaused)
			return;

		GAME.gui.statsTick.begin();
		var delta = tickClock.getDelta();
		game.scene.tick(delta, game);
		GAME.audio.tick(delta, game);
		GAME.gui.statsTick.end();
	}

	var animClock = new THREE.Clock();

	function render() {
		requestAnimationFrame(render);
		
		if (game.isPaused)
			return;

		GAME.gui.statsRender.begin();
		var delta = animClock.getDelta();
		TWEEN.update();
		THREE.AnimationHandler.update(delta);
		game.scene.animate(delta, game);
		game.renderer.render(game.scene, game.camera);
		GAME.gui.statsRender.end();
	}

	this.main = function() {
		init();
	};
}).call(GAME.namespace('core.Main'));