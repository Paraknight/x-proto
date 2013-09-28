'use strict';

var SERVER = { port: 8888 };

(function () {
	var self = this;

	var http = require('http');
	var userdb = require('./userdb');

	userdb.connect(function () {
		http.createServer(onRequest).listen(self.port);
	});
	

	function onRequest (request, response) {
		response.writeHead(200, {'Content-Type': 'text/plain'});

		response.write('It\'s working!');

		// "INSERT INTO `users`.`accounts` (`id`, `username`, `password`, `email`, `state`, `randHash`, `lastLogin`, `joinDate`) VALUES (NULL, 'Primo', 'password', 'admin@google.com', '0', '1337', '0000-00-00 00:00:00', CURRENT_TIMESTAMP);"
		// db.query("SELECT * FROM `accounts`", function (error, rows, fields) {
		// 	if (error)
		// 		response.write(error.toString());

		// 	response.write(rows.toString());
		// 	response.write(fields.toString());
		// });

		console.log('waka');
		userdb.getIDUser('Primo', function (userCount) {
			console.log(userCount);
		});

		response.end();
	}
}).call(SERVER);