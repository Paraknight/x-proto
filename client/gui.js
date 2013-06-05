GAME.namespace('gui').init = function() {
	GAME.gui.transitionEnd=	'ontransitionend' in window ? 'transitionend' :
							'onwebkittransitionend' in window ? 'webkitTransitionEnd' :
							//('onotransitionend' in myDiv || navigator.appName == 'Opera') ? 'oTransitionEnd' :
							false;

	var overlay = document.getElementById('overlay');
	GAME.gui.statsTick = new Stats();
	//statsTick.domElement.style.position = 'absolute';
	//statsTick.domElement.style.top = 0;
	//statsRender.domElement.style.zIndex = 100;
	//statsRender.setMode(1);
	overlay.appendChild(GAME.gui.statsTick.domElement);
	GAME.gui.statsRender = new Stats();
	//statsRender.domElement.style.position = 'absolute';
	//statsRender.domElement.style.top = 0;
	//statsRender.domElement.style.zIndex = 100;
	//statsRender.setMode(1);
	overlay.appendChild(GAME.gui.statsRender.domElement);

	// TODO: Modularise GUI.
	/*
	var clientForm = document.getElementById('clientForm');
	var onTransitionEnd = function() {
		clientForm.console.scrollTop = clientForm.console.scrollHeight - clientForm.console.clientHeight;
	};
	clientForm.console.addEventListener(transitionEnd, onTransitionEnd, false);
	*/


	function allowDrop (event) {
		event.preventDefault();
	}

	function drag (event) {
		event.dataTransfer.setData('Text',event.target.id);
	}

	function drop (event) {
		event.preventDefault();
		var element = document.getElementById(event.dataTransfer.getData('Text'));
		if (event.target != element) {
			if (element.parentNode.id == 'invSlot5')
				GAME.game.player.setHeldItem(null);
			event.target.appendChild(element);
			if (event.target.id == 'invSlot5')
				GAME.game.player.setHeldItem(element.id);
		}
	}

	function createWindow (x, y, w, h) {
		var win = document.createElement('div');
		win.className = 'window draggable';
		win.style.display = 'none';
		win.style.top = y+'px';
		win.style.left = x+'px';
		win.style.width = w+'px';
		win.style.height = h+'px';
		overlay.appendChild(win);
		return win;
	}

	var playerWin = createWindow(((window.innerWidth-432)/2)|0,((window.innerHeight-432)/2)|0,432,432);
	playerWin.id = 'playerWin';
	var equip = document.createElement('div');

	for (var i = 0; i < 4; i++) {
		var slot = document.createElement('div');
		slot.id = 'invSlot'+i;
		slot.className = 'itemSlot';
		slot.style.top = (27+i*54)+'px';
		slot.style.left = '20%';
		slot.ondrop = drop;
		slot.ondragover = allowDrop;
		equip.appendChild(slot);
	}

	for (var i = 0; i < 4; i++) {
		var slot = document.createElement('div');
		slot.id = 'invSlot'+(4+i);
		slot.className = 'itemSlot';
		slot.style.top = (27+i*54)+'px';
		slot.style.right = '20%';
		slot.ondrop = drop;
		slot.ondragover = allowDrop;
		equip.appendChild(slot);
	}

	var inv = document.createElement('div');
	inv.style.position = 'absolute';
	inv.style.bottom = 0;

	for (var i = 0; i < 24; i++) {
		var slot = document.createElement('div');
		slot.id = 'invSlot'+(8+i);
		slot.className = 'itemSlot';
		slot.style.top = (-149+((i*0.125)|0)*50)+'px';
		slot.style.left = (5+(i%8)*54)+'px';
		slot.ondrop = drop;
		slot.ondragover = allowDrop;
		inv.appendChild(slot);
	}

	playerWin.appendChild(equip);
	playerWin.appendChild(inv);

	var axeItem = document.createElement('img');
	axeItem.id = 'axeItem';
	axeItem.src = 'http://maidenwars.com/icons/icon_mainhand_axe_1.png';
	axeItem.draggable = true;
	axeItem.ondragstart = drag;
	document.getElementById('invSlot5').appendChild(axeItem);
};

GAME.gui.setChatFocus = function (flag, scope) {
	scope.form.console.className = flag?'maxSize fadeIn':'minSize fadeOut';
	document.getElementById('passiveChat').className = flag?'fadeOut':'fadeIn';
};

GAME.gui.log = function (text) {
	var clientForm = document.getElementById('clientForm');
	clientForm.console.value += text+"\n";
	clientForm.console.scrollTop = clientForm.console.scrollHeight - clientForm.console.clientHeight;
	
	var chatLine = document.createElement('div');
	chatLine.appendChild(document.createTextNode(text));
	//chatLine.appendChild(document.createElement('br'));
	var passiveChat = document.getElementById('passiveChat');
	passiveChat.appendChild(chatLine);

	setTimeout(function(){chatLine.className='fadeOut';}, 10000);
	chatLine.addEventListener(GAME.gui.transitionEnd, function(){
		passiveChat.removeChild(passiveChat.firstChild);
	}, false);
};

GAME.gui.submitConsoleInput = function (form) {
	var text = form.input.value.trim();
	form.input.value = '';
	if (!text.length) return;

	if (text.charAt(0) == '/') {
		var input = text.split(' ');
		var cmd = input[0].substring(1);
		var args = input.slice(1);

		// TODO: Build event-handler system.
		// TODO: Error detection, case-sesitivity, non-existent host, success notification, etc.
		switch(cmd) {
		case 'join':
			if (args.length > 0)
				GAME.net.p2p.join(args[0]);
			else
				GAME.gui.log('Join syntax: "/join [HostID]".');
			break;
		case 'host':
			GAME.net.p2p.host();
			break;
		case 'time':
			if (args.length > 0)
				GAME.game.time = parseFloat(args[0])%1.0;
			else
				GAME.gui.log('Time syntax: "/time [0.0-1.0)".');
			break;
		default:
			GAME.gui.log('Invalid command.');
			break;
		}
	} else {
		GAME.net.p2p.send('chat', text);
		GAME.gui.log('You: '+text);
		GAME.audio.loadSpeech(text, function (audioElement) {
			var source = new GAME.audio.AudioSourceStreaming(audioElement);
			// TODO: Avoid static calls.
			// TODO: Follow position while still playing.
			source.setPosition(GAME.game.camera.localToWorld(new THREE.Vector3()));
			source.play();
		});
	}
};		