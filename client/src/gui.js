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


	function createWindow (x, y, w, h) {
		var win = document.createElement('div');
		win.className = 'window draggable';
		win.style.top = y+'px';
		win.style.left = x+'px';
		win.style.width = w+'px';
		win.style.height = h+'px';
		overlay.appendChild(win);
		return win;
	}

	var playerWin = createWindow(((window.innerWidth-432)/2)|0,((window.innerHeight-432)/2)|0,432,432);
	playerWin.id = 'playerWin';
	playerWin.style.display = 'none';
	
	var equip = document.createElement('div');

	function allowDrop (event) {
		event.preventDefault();
	}

	function drag (event) {
		event.dataTransfer.setData('Text', event.target.id);
	}

	function drop (event) {
		event.preventDefault();
		
		var itemImg = document.getElementById(event.dataTransfer.getData('Text'));
		var destSlot = event.target;

		if (destSlot === itemImg) return;

		destSlot.slot.put(itemImg.item);
	}

	var Slot = function (id, x, y) {
		var div = this.div = document.createElement('div');
		div.slot = this;
		div.id = 'invSlot'+id;
		div.className = 'itemSlot';
		div.style.left = x;
		div.style.top = y;
		
		div.ondrop = drop;
		div.ondragover = allowDrop;
	}

	Slot.prototype.setBG = function (url, x, y) {
		x = x || '0px';
		y = y || '0px';
		this.div.style.backgroundImage = 'url(\''+url+'\')';
		this.div.style.backgroundPosition = '-'+x+' -'+y;
		return this;
	};
	
	Slot.prototype.put = function (item) {
		var sourceSlot = item.img.parentNode;
		
		this.div.appendChild(item.img);

		sourceSlot && 'onRemove' in sourceSlot.slot && sourceSlot.slot.onRemove(item);
		'onPut' in this && this.onPut(item);
	};

	Slot.prototype.remove = function (item) {
		this.div.removeChild(item.img);
		'onRemove' in this && this.onRemove(item);
	};

	equip.appendChild(new Slot(0, '20%', '27px').setBG('res/textures/spritesheet.png').div);
	equip.appendChild(new Slot(1, '20%', '81px').setBG('res/textures/spritesheet.png', '0px', '40px').div);

	var handSlot = new Slot(2, '20%', '135px');
	handSlot.onPut = function (item) {
		console.log(item);
	};
	handSlot.onRemove = function (item) {
		console.log(item);
	};
	equip.appendChild(handSlot.div);

	equip.appendChild(new Slot(3, '20%', '189px').div);


	var inv = document.createElement('div');
	inv.style.position = 'absolute';
	inv.style.bottom = 0;

	for (var i = 0; i < 24; i++)
		inv.appendChild(new Slot(8+i, (5+(i%8)*54)+'px', (-149+((i*0.125)|0)*50)+'px').div);


	playerWin.appendChild(equip);
	playerWin.appendChild(inv);


	var Item = function (name, spriteSheetURL, x, y) {
		var img = this.img = document.createElement('img');
		img.item = this;
		img.id = 'itemImg'+name;
		img.src = 'res/textures/null.png';
		img.style.backgroundImage = 'url(\''+spriteSheetURL+'\')';
		img.style.backgroundPosition = '-'+x+' -'+y;
		img.draggable = true;
		img.ondragstart = drag;
	}

	handSlot.put(new Item('axe', 'res/textures/spritesheet.png', '40px', '0px'));
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