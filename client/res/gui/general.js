GAME.gui.general.createWindow = function (x, y, w, h) {
	var win = document.createElement('div');
	win.className = 'window draggable';
	win.style.top = y+'px';
	win.style.left = x+'px';
	win.style.width = w+'px';
	win.style.height = h+'px';
	overlay.appendChild(win);
	return win;
};

GAME.gui.general.Instructions = function () {
	var div = document.getElementById('instructions');
	if (!div) {
		div = document.createElement('div');
		div.id = 'instructions';
		if (!('innerHTML' in this)) {
			GAME.utils.xhrAsyncGet('res/gui/instructions.html', function (html) {
				div.innerHTML = GAME.gui.general.Instructions.prototype.innerHTML = html;
				document.getElementById('game').insertBefore(div, document.getElementById('loadingScreen'));
				GAME.utils.centerElement(div);
			});
		} else {
			div.innerHTML = this.innerHTML;
			document.getElementById('game').insertBefore(div, document.getElementById('loadingScreen'));
			GAME.utils.centerElement(div);
		}
	}
	document.getElementById('blocker').addEventListener('click', function (event) {
		instructions.style.display = 'none';
	}, false);
};

GAME.gui.general.Inventory = function () {
	var playerWin = GAME.gui.general.createWindow(((window.innerWidth-432)/2)|0,((window.innerHeight-432)/2)|0,432,432);
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

	var game = GAME.game;
	var handSlot = new Slot(2, '20%', '135px');
	handSlot.onPut = function (item) {
		// TODO: Make slots reject unfitting items.
		if (item.entityClass) {
			this.entity = new item.entityClass(game.scene).setOwner(game.player);
		}
	};
	handSlot.onRemove = function (item) {
		if (this.entity) {
			this.entity.resetOwner();
			this.entity = null;
		}
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

	var id = 0;

	GAME.gui.general.Item = function (spriteSheetURL, x, y, entityClass) {
		var img = this.img = document.createElement('img');
		img.item = this;
		img.id = 'itemImg'+(id++);
		img.src = 'res/textures/null.png';
		img.style.backgroundImage = 'url(\''+spriteSheetURL+'\')';
		img.style.backgroundPosition = '-'+x+' -'+y;
		img.draggable = true;
		img.ondragstart = drag;

		this.entityClass = entityClass;
	}
}