(function() {
	var TICK_INTERVAL_MS = 1000.0/60.0;

	var game = GAME.game = this;

	game.setLoadingText = function (text) {
		console.log('> '+text);
		var loadingDiv = document.getElementById('loadingText');
		loadingDiv.innerHTML = text;
		GAME.utils.centerElement(loadingDiv);
	}

	game.joinScene = function (name, onJoin) {
		var loadingScreen = document.getElementById('loadingScreen');
		loadingScreen.style.display = '';
		game.setLoadingText('Loading Scene...');
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
		game.renderer = new THREE.WebGLRenderer({ antialias: true });
		game.renderer.setSize(window.innerWidth, window.innerHeight);
		game.renderer.shadowMapEnabled = true;
		game.renderer.shadowMapSoft = true;
		game.renderer.sortObjects = false;

		GAME.gui.init();

		window.addEventListener('resize', function(){
			if (game.camera) {
				game.camera.aspect = window.innerWidth/window.innerHeight;
				game.camera.updateProjectionMatrix();
			}
			game.renderer.setSize(window.innerWidth, window.innerHeight);
		}, false);

		document.getElementById('game').insertBefore(game.renderer.domElement, document.getElementById('overlay'));

		game.joinScene('island', function () {
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
		game.scene.tick(delta, game);
		GAME.audio.tick(delta, game);
		GAME.gui.statsTick.end();
	}

	var animClock = new THREE.Clock();

	function render() {
		requestAnimationFrame(render);

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
}).apply(GAME.namespace('core.Main'));