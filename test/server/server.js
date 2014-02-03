'use strict';

var SERVER = { port: 8888 };

(function () {
	var self = this;

	var userdb = require('./userdb');

	var express = require('express');
	var server = express();
	
	server.use(express.favicon());
	server.use(express.cookieParser());
	server.use(express.session({secret: '7f81d584-1165-4886-8cd3-e10b1beb3f63'}));

	server.get('/', function(req, res){
		req.session.count = req.session.count || 0;
		res.send('It\'s working!'+(req.session.count++));

		console.log('waka');
		userdb.getIDUser('Primo', function (userCount) {
			console.log(userCount);
		});
	});

	userdb.connect(function () {
		server.listen(self.port);
	});
}).call(SERVER);