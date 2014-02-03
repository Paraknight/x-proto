var db = require('mysql').createConnection({
	host: 'localhost',
	user: 'standard',
	password: 'standard'
});

function onError (error) {
	console.log(error);
}

function randHex32 () {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random()*16|0, v=c=='x'?r:r&0x3|0x8;
		return v.toString(16);
	});
}

var crypto = require('crypto');

function encrypt (data, salt) {
	salt = salt || randHex32();
	return salt + crypto.createHash('sha256').update(salt + data).digest('hex');
}

var mailer = require('nodemailer').createTransport('SMTP', {
	service: "Gmail",
	auth: {
		user: "yousefamar@gmail.com",
		pass: "bashbash4y"
	}
});


module.exports = {
	connect: function (callback) {
		db.connect(function (error) {
			if (error)
				onError(error);
			
			db.query("USE `users`");

			mailer.sendMail({
				from: 'Sender Name <sender@example.com>',
				to: '"Receiver Name" <yousefamar@gmail.com>',
				subject: 'Nodemailer is unicode friendly ✔',

				text: 'Hello to myself! http://www.google.com',
			});

			callback();
		});
	},

	disconnect: function () {
		db.end(function (error) {
			if (error)
				onError(error);
		});
	},
	
	userExists: function (username, callback) {
		db.query("SELECT count(`id`) FROM `accounts` WHERE `username` = " + db.escape(username), function (error, rows) {
			if (error)
				onError(error);
			
			// Argument is the number of users in the table that meet the above condition.
			callback(rows[0]['count(`id`)']);
		});
	},

	emailExists: function (email, callback) {
		db.query("SELECT count(`id`) FROM `accounts` WHERE `email` = " + db.escape(email), function (error, rows) {
			if (error)
				onError(error);
			
			callback(rows[0]['count(`id`)']);
		});
	},

	userConfirmed: function (username, callback) {
		db.query("SELECT count(`id`) FROM `accounts` WHERE `username` = " + db.escape(username) + " AND `state` != 0", function (error, rows) {
			if (error)
				onError(error);
			
			callback(rows[0]['count(`id`)']);
		});
	},

	getActiveUserCount: function (callback) {
		db.query("SELECT count(`id`) FROM `accounts` WHERE `state` != 0", function (error, rows) {
			if (error)
				onError(error);
			
			callback(rows[0]['count(`id`)']);
		});
	},

	getIDUser: function (username, callback) {
		db.query("SELECT `id` FROM `accounts` WHERE `username` = " + db.escape(username), function (error, rows) {
			if (error)
				onError(error);
			
			callback(rows[0]['id']);
		});
	},

	// setUserSessionID: function (userID, sessionID) {
	//  mysql_query("UPDATE `accounts` SET `sessionID` = " + db.escape(sessionID) + ", `lastLogin` = NOW() WHERE `id` = $userID");
	// }

	loginUser: function (session, username, password, callback) {
		if (!username || !password) {
			callback(1);
			return;
		}

		this.credentialsCorrect(username, password, function (flag) {
			if (!flag) {
				callback(2);
				return;
			}

			this.userConfirmed(username, function (flag) {
				if (!flag) {
					callback(3);
					return;
				}

				session['id'] = this.getIDUser(username);
				callback(0);                
			});
		});
	},

	credentialsCorrect: function (username, password, callback) {
		this.userExists(username, function (flag) {
			if (!flag) {
				callback(false);
				return;
			}

			db.query("SELECT `password` FROM `accounts` WHERE `username` = " + db.escape(username), function (error, rows) {
				if (error)
					onError(error);
				
				dbPassHash = rows[0]['password'];
				callback(encrypt(password, dbPassHash.substring(0, 32)) === dbPassHash);
			});
		});
	},

	logout: function (session) {
		session.destroy(function (error){
			if (error)
				onError(error);

		});
	},

	userLoggedIn: function (session) {
		return session && session['id'];
	},

	registerUser: function (userInfo, callback) {
		userInfo['password'] = encrypt(userInfo['password']);

		var keys = [];
		for (var key in userInfo)
			keys.push(key);
		
		db.query("INSERT INTO `accounts` (`"+keys.join("`, `")+"`) VALUES ("+db.escape(userInfo)+")", function (error, rows) {
			if (error)
				onError(error);
			
			//sendVerificationEmail($userInfo["email"], $userInfo["username"], $userInfo["randHash"]);
			callback();
		});
	},

	getAll: function () {
		db.query("SELECT * FROM `accounts`", function (error, rows) {
			if (error)
				onError(error);

			console.log(rows);
		});
	}
};

// function sendVerificationEmail($email, $username, $hash) {
//  sendGenericEmail($email, "4YTech Account Verification", "Hello ".$username.",\n\nThank you for registering with 4YTech!\nIf you did not register with us, please ignore this email. To verify your email address and activate your account, please click the following link or copy it into the URL bar:\n\n".home()."/usr/activate.php?email=".$email."&hash=".$hash."\n\n~4YTech");
// }

// function activateAccount($email, $hash) {
//  $email = sanitise($email);
//  $hash = sanitise($hash);

//  if (!emailExists($email))
//      return 1;
//  if(mysql_result(mysql_query("SELECT count(`id`) FROM `users` WHERE `email` = '$email' AND `state` != 0"), 0))
//      return 2;
//  if (!mysql_result(mysql_query("SELECT count(`id`) FROM `users` WHERE `email` = '$email' AND `randHash` = '$hash' AND `state` = 0"), 0))
//      return 3;
	
//  mysql_query("UPDATE `users` SET `state` = 1 WHERE `email` = '$email' AND `randHash` = '$hash' AND `state` = 0");
//  return 0;
// }

// function changeUserPassword($username, $newPass) {
//  //TODO: Think about whether ids or usernames should be used for identification and how much info you need for this function.
//  $username = sanitise($username); //Really though?
//  $newPass = encrypt(sanitise($newPass));
//  mysql_query("UPDATE `users` SET `password` = '$newPass' WHERE `username` = '$username'");
// }

// function setAccountState() {
//  //TODO: Consider implementing this.
// }

// function setUserField($id, $field, $value) {
//  //TODO: Think about this.
//  $id = sanitise($id);
//  $field = sanitise($field);
//  $value = sanitise($value);
//  mysql_query("UPDATE `users` SET `$field` = '$value' WHERE `id` = '$id'");
// }

// function getUserInfo($id) {
//  return mysql_fetch_assoc(mysql_query("SELECT * FROM `users` WHERE `id` = $id"));
// }

// ?>