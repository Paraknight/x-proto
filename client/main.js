GAME.namespace('core').main = function () {
	if ('game' in GAME)
		return;

	GAME.game = {};
	var game = GAME.game;

	game.tickList = [];
	game.animList = [];

	game.setLoadingText = function (text) {
		console.log(text);
		var loadingDiv = document.getElementById('loadingText');
		loadingDiv.innerHTML = text;
		GAME.utils.centerElement(loadingDiv);
	}

	const TICK_INTERVAL_MS = 1000.0/60.0;
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

	/*
	var worker = new Worker('./worker.js');
	worker.onmessage = function (event) {
		document.getElementById('result').textContent = event.data;
	};
	worker.postMessage();
	*/

	game.setLoadingText('Building Scene...');
	GAME.world.buildSceneIsland(game, function (argument) {
		game.setLoadingText('Initialising Controls...');
		GAME.input.init(game.scene, game.player);

		game.setLoadingText('Constructing Visuals...');
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

		game.setLoadingText('Done.');
		document.getElementById('loadingScreen').style.display = 'none';

		setTimeout(tick, TICK_INTERVAL_MS);
		requestAnimationFrame(render);
	});

	/*
	var game = {};

	game.currentScene = new CONQUEST.Scene();
	game.currentGUI = new CONQUEST.GUIMainMenu(game);

	var canvas = document.getElementById('canvas');

	canvas.addEventListener('mousedown', function (event) {
		game.currentGUI.mouseDown(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event) ||
			game.currentScene.mouseDown(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event);
	}, false);
	canvas.addEventListener('mousemove', function (event) {
		game.currentGUI.mouseMove(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event) ||
			game.currentScene.mouseMove(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event);
	}, false);
	canvas.addEventListener('mouseup', function (event) {
		game.currentGUI.mouseUp(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event) ||
			game.currentScene.mouseUp(event.offsetX||event.layerX||0, event.offsetY||event.layerY||0, event);
	}, false);
	document.body.addEventListener('keydown', function (event) {
		game.currentGUI.keyDown(event.keyCode) ||
			game.currentScene.keyDown(event.keyCode);
	});
	document.body.addEventListener('keyup', function (event) {
		game.currentGUI.keyUp(event.keyCode) ||
			game.currentScene.keyUp(event.keyCode);
	});
	*/
};