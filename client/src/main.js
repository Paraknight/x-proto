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

		var overlay = document.getElementById('overlay');
		document.getElementById('game').insertBefore(game.renderer.domElement, overlay);
		overlay.appendChild(statsTick.domElement);
		overlay.appendChild(statsRender.domElement);

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

	var statsTick = new Stats();
	var tickClock = new THREE.Clock();

	function tick() {
		// FIXME: Chrome throttles the interval down to 1s on inactive tabs.
		setTimeout(tick, TICK_INTERVAL_MS);

		if (game.isPaused)
			return;

		statsTick.begin();
		var delta = tickClock.getDelta();
		game.scene.tick(delta, game);
		GAME.audio.tick(delta, game);
		statsTick.end();
	}

	var statsRender = new Stats();
	var animClock = new THREE.Clock();

	function render() {
		requestAnimationFrame(render);

		if (game.isPaused)
			return;

		statsRender.begin();
		var delta = animClock.getDelta();
		TWEEN.update();
		THREE.AnimationHandler.update(delta);
		game.scene.animate(delta, game);
		game.renderer.render(game.scene, game.camera);
		statsRender.end();
	}

	this.main = function() {
		init();
	};
}).call(GAME.namespace('core.Main'));