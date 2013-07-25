GAME.namespace('scenes').island = {
	name: 'Island',
	models: [
		'tools.axe',
		'tree.tree',
		'tree.timber',
		'tree.stump',
		'portalradio.portalradio',
		'player.torso',
		'player.head'
	],
	player: {
		'position': [0,45,20],
		'controller': 'firstperson'
	},
	entities: [
		'skies',
		'terrain',
		'tools'
	],
	init: function () {
		new GAME.entities.tools.Axe(this).setOwner(this.player);
	}
};