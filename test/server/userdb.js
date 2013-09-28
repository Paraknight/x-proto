var db = require('mysql').createConnection({
	host: 'localhost',
	user: 'standard',
	password: 'standard'
});

function onError (error) {
	console.log(error);
}

module.exports = {
	connect: function (callback) {
		db.connect(function (error) {
			if (error)
				onError(error);
			
			db.query("USE `users`");

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
	// 	mysql_query("UPDATE `accounts` SET `sessionID` = " + db.escape(sessionID) + ", `lastLogin` = NOW() WHERE `id` = $userID");
	// }

	// loginUser: function (username, password, callback) {
	// 	if (empty($username) || empty($password)) {
	// 		callback(1);
	// 	} else if (!credentialsCorrect($username, $password)) {
	// 		callback(2);
	// 	} else if (!userConfirmed($username)) {
	// 		callback(3);
	// 	} else {
	// 		$_SESSION["id"] = getIDUser($username);
	// 		callback(0);
	// 	}
	// },

	getAll: function () {
		db.query("SELECT * FROM `accounts`", function (error, rows) {
			if (error)
				onError(error);

			console.log(rows);
		});
	}
};


// function credentialsCorrect($username, $password) {
// 	if (!userExists($username))
// 		return false;

// 	$username = sanitise($username);
// 	$dbPassHash = mysql_result(mysql_query("SELECT `password` FROM `users` WHERE `username` = '$username'"), 0);
// 	return encrypt(sanitise($password), substr($dbPassHash, 0, 64)) == $dbPassHash;
// }

// function logout() {
// 	session_unset();
// 	session_destroy();
// }

// function userLoggedIn() {
// 	return isset($_SESSION["id"]);
// }

// function registerUser($registrationInfo) {
// 	foreach ($registrationInfo as $key => $value)
// 		$registrationInfo[$key] = sanitise($value);
// 	$registrationInfo["password"] = encrypt($registrationInfo["password"]);
	
// 	$fields = "`".implode("`, `", array_keys($registrationInfo))."`";
// 	$values = "'".implode("', '", $registrationInfo)."'";
// 	mysql_query("INSERT INTO `users` ($fields) VALUES ($values)");
// 	sendVerificationEmail($registrationInfo["email"], $registrationInfo["username"], $registrationInfo["randHash"]);
// }

// function sendVerificationEmail($email, $username, $hash) {
// 	sendGenericEmail($email, "4YTech Account Verification", "Hello ".$username.",\n\nThank you for registering with 4YTech!\nIf you did not register with us, please ignore this email. To verify your email address and activate your account, please click the following link or copy it into the URL bar:\n\n".home()."/usr/activate.php?email=".$email."&hash=".$hash."\n\n~4YTech");
// }

// function activateAccount($email, $hash) {
// 	$email = sanitise($email);
// 	$hash = sanitise($hash);

// 	if (!emailExists($email))
// 		return 1;
// 	if(mysql_result(mysql_query("SELECT count(`id`) FROM `users` WHERE `email` = '$email' AND `state` != 0"), 0))
// 		return 2;
// 	if (!mysql_result(mysql_query("SELECT count(`id`) FROM `users` WHERE `email` = '$email' AND `randHash` = '$hash' AND `state` = 0"), 0))
// 		return 3;
	
// 	mysql_query("UPDATE `users` SET `state` = 1 WHERE `email` = '$email' AND `randHash` = '$hash' AND `state` = 0");
// 	return 0;
// }

// function changeUserPassword($username, $newPass) {
// 	//TODO: Think about whether ids or usernames should be used for identification and how much info you need for this function.
// 	$username = sanitise($username); //Really though?
// 	$newPass = encrypt(sanitise($newPass));
// 	mysql_query("UPDATE `users` SET `password` = '$newPass' WHERE `username` = '$username'");
// }

// function setAccountState() {
// 	//TODO: Consider implementing this.
// }

// function setUserField($id, $field, $value) {
// 	//TODO: Think about this.
// 	$id = sanitise($id);
// 	$field = sanitise($field);
// 	$value = sanitise($value);
// 	mysql_query("UPDATE `users` SET `$field` = '$value' WHERE `id` = '$id'");
// }

// function getUserInfo($id) {
// 	return mysql_fetch_assoc(mysql_query("SELECT * FROM `users` WHERE `id` = $id"));
// }

// ?>