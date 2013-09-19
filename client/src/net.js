GAME.namespace('net').p2p = {
	send: function(){},

	join: function (hostID) {
		var peer = new Peer('Player'+Math.floor(Math.random()*999), { host: '4ytech.com', port: 9980, debug: true });
		var connection = peer.connect(hostID);

		connection.on('open', function() {
			GAME.net.p2p.send = function () {
				connection.send({ event: arguments[0], args: Array.prototype.slice.call(arguments, 1) });
			};
		});

		var game = GAME.game;

		var eventHandlers = {};
		function on (eventName, eventHandler) {
			eventHandlers[eventName] = eventHandler;
		}

		connection.on('data', function (data) {
			if ('event' in data && data.event in eventHandlers)
				eventHandlers[data.event].apply(GAME.net.p2p, data.args);
		});

		connection.on('error', function (error) {
			console.error(error);
		});

		connection.on('close', function () {
			GAME.gui.log('You\'ve been disconnected from '+connection.peer+'.');
		});

		on('state', function (state, userID) {
			state.pos = new THREE.Vector3().fromArray(state.pos);
			state.rot = new THREE.Vector3().fromArray(state.rot);
			if (userID in game.scene.entityManager.players) {
				var player = game.scene.entityManager.players[userID];
				player.onStateReceived(state);
			} else {
				game.scene.entityManager.spawnPlayer(userID, state);
			}
		});

		on('despawn', function (userID) {
			game.scene.entityManager.despawnPlayer(userID);
		});

		on('log', function (packet) {
			GAME.gui.log(packet.msg);
			if (packet.mute) return;
			GAME.audio.loadSpeech(packet.msg, function (audioElement) {
				var source = new GAME.audio.AudioSourceStreaming(audioElement);
				// TODO: Follow position while still playing.
				source.setPosition(game.camera.localToWorld(new THREE.Vector3()));
				source.play();
			}, { pitch: 100 });
		});

		on('chat', function (text, userID) {
			userID = userID || connection.peer;
			GAME.gui.log(userID+": "+text);
			GAME.audio.loadSpeech(text, function (audioElement) {
				var source = new GAME.audio.AudioSourceStreaming(audioElement);
				// TODO: Follow position while still playing.
				source.setPosition(game.scene.entityManager.players[userID].position);
				source.play();
			});
		});

		on('ping', function () {
			this.send('pong');
		});
	},

	host: function () {
		var host = new Peer('Host', { host: '4ytech.com', port: 9980, debug: true });
		var peers = [];

		function broadcast () {
			var packet = { event: arguments[0], args: Array.prototype.slice.call(arguments, 1) };
			for (var i = 0; i < peers.length; i++)
				peers[i].send(packet);
		}

		host.on('connection', function (connection, metadata) {
			peers.push(connection);

			connection.on('open', function () {
				// TODO: Consider moving to client.
				broadcast('log', { msg: connection.peer+' has joined the game.' });
			});

			connection.on('data', function (data) {
				if ('args' in data)
					data.args.push(connection.peer);
				for (var i = 0; i < peers.length; i++)
					if (peers[i] != connection)
						peers[i].send(data);
			});

			connection.on('error', function (error) {
				console.error(error);
			});

			connection.on('close', function () {
				var peerIndex = peers.indexOf(connection);
				if (peerIndex < 0) return;
				peers.splice(peerIndex, 1);
				broadcast('despawn', connection.peer);
				// TODO: Consider moving to client.
				broadcast('log', { msg: connection.peer+' has left the game.' });
			});
		});

		this.join('Host');
	}
};