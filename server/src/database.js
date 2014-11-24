var MySQL = require('mysql');
var config = require('../config.json');

function Database() {
	this.pool = MySQL.createPool(config.database);
	this.pool.getConnection(function(err, conn) {
	    if(err) {
	        console.log("Connecting to Database ... Failed.");
	        conn.release();
	    }
	    else {
	        conn.release();
	        console.log("Connecting to Database ... Done.");
			process.stdout.write("Getting tables ready ... ");
			function checkError(err) {
				if(err) {
					console.error("An error occured when creating the tables:");
					console.error(err);
					return false;
				}
				else {
					return true;
				}
			}
			var pool = this.pool;
			createUsers();
			function createUsers() {
				pool.query(
					"CREATE TABLE IF NOT EXISTS Users (" +
						"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
						"name			VARCHAR(128) NOT NULL UNIQUE," +
						"steamid		VARCHAR(128) NOT NULL UNIQUE," +
						"enabled		BOOL," +
						"password		VARCHAR(128) NOT NULL)", function(err) {
					if(checkError(err)) createFriends();
				});
			}
			function createFriends() {
				pool.query(
					"CREATE TABLE IF NOT EXISTS Friends (" +
						"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
						"user			INT NOT NULL," +
						"friend			INT NOT NULL," +
						"FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE," +
						"FOREIGN KEY(friend) REFERENCES Users(id) ON DELETE CASCADE)", function(err) {
					if(checkError(err)) createAdmins();
				});
			}
			function createAdmins() {
				pool.query(
					"CREATE TABLE IF NOT EXISTS Admins (" +
						"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
						"user			INT NOT NULL UNIQUE," +
						"FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE)", function(err) {
					if(checkError(err)) createMarkers();
				});
			}
			function createMarkers() {
				pool.query(
					"CREATE TABLE IF NOT EXISTS Markers (" +
						"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
						"name			VARCHAR(128) NOT NULL," +
						"description	TEXT," +
						"lat			FLOAT NOT NULL," +
						"lng			FLOAT NOT NULL," +
						"visibility		ENUM('private', 'friends', 'public') NOT NULL DEFAULT 'public', " +
						"author			INT NOT NULL, " +
						"icon			VARCHAR(32) NOT NULL," +
						"FOREIGN KEY(author) REFERENCES Users(id) ON DELETE CASCADE)", function(err) {
					if(checkError(err)) createMarkerIgnore();
				});
			}
			function createMarkerIgnore() {
				pool.query(
					"CREATE TABLE IF NOT EXISTS MarkerIgnore (" +
						"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
						"user			INT NOT NULL," +
						"marker			INT NOT NULL," +
						"FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE," +
						"FOREIGN KEY(marker) REFERENCES Markers(id) ON DELETE CASCADE)", function(err) {
					if(checkError(err)) console.log("All tables okay.");
				});
	    	}
		}
	}.bind(this));
};

Database.prototype.addMarker = function(obj, author, callback) {
	this.pool.query("INSERT INTO Markers (name, description, lat, lng, icon, visibility, author) VALUES(?, ?, ?, ?, ?, ?, ?)",
		[obj.name, obj.description, obj.lat, obj.lng, obj.icon, obj.visibility, author], function(err, result) {
		if(err) {
			console.error("Unable to create Marker:");
			console.error(err);
			callback(err);
		}
		else {
			obj.id = result.insertId;
			obj.author = author;
			callback(undefined, obj);
		}
	});
};

Database.prototype.removeMarker = function(id, userid, callback) {
	this.pool.query("DELETE FROM Markers WHERE id = ? AND author = ?", [id, userid], function(err) {
		if(err) {
			console.error("Unable to remove Marker:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.validateUser = function(username, password, callback) {
	if(username !== undefined && password !== undefined) {
		this.pool.query("SELECT id FROM Users WHERE name = ? AND password = ?", [username, password], function(err, rows) {
			if(err) {
				console.error("Unable to validate user:");
				console.error(err);
				callback(err);
			}
			else {
				callback(undefined, rows !== undefined && rows.length == 1);
			}
		});
	}
	else {
		callback(undefined, false);
	}
};

Database.prototype.getFriendsOf = function(id, callback) {
	this.pool.query("SELECT u.id AS id, u.name AS name FROM Friends f LEFT JOIN Users u ON f.user = u.id WHERE u.id = ?", [id], function(err, rows) {
		if(err) {
			console.error("Unable to get friends of:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined, rows);
		}
	});
};

Database.prototype.isFriendOf = function(me, friendOf, callback) {
	this.pool.query("SELECT id FROM Friends WHERE user = ? AND friend = ?", [friendOf, me], function(err, rows) {
		if(err) {
			console.error("Unable to check, if someone is someones friend:");
			console.error(err);
			callback(err);
		}
		else {
			if(rows == undefined || rows.length < 1) {
				callback(undefined, false);
			}
			else {
				callback(undefined, true);
			}
		}
	});
};

Database.prototype.getFriendsBy = function(id, callback) {
	this.pool.query("SELECT u.id AS id, u.name AS name FROM Friends f LEFT JOIN Users u ON f.friend = u.id WHERE u.id = ?", [id], function(err, rows) {
		if(err) {
			console.error("Unable to get friends by:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined, rows);
		}
	});
};

Database.prototype.fetchMarkers = function(id, callback) {
	if(id === undefined) {
		this.pool.query("SELECT id, name, description, lat, lng, visibility, author, icon " +
						"FROM markers " +
						"WHERE visibility = 'public'", function(err, rows) {
			if(err) {
				console.error("Unable to fetch Markers:");
				console.error(err);
				callback(err);
			}
			else {
				callback(undefined, rows);
			}
		});
	}
	else {
		this.pool.query("SELECT id, name, description, lat, lng, visibility, author, icon " +
							"FROM markers " +
							"WHERE author = ? OR (" +
								"visibility = 'public' OR (" +
									"visibility = 'friends' AND " +
									"author IN (SELECT friend FROM friends WHERE user = ?)" +
								")" +
							") AND NOT id IN (SELECT marker FROM markerIgnore WHERE user = ?)", [id, id, id], function(err, rows) {
			if(err) {
				console.error("Unable to fetch Markers:");
				console.error(err);
				callback(err);
			}
			else {
				callback(undefined, rows);
			}
		});
	}
};

Database.prototype.addUser = function(obj, callback) {
	this.pool.query("INSERT INTO Users(name, steamid, password, enabled) VALUES(?, ?, ?, false)", [obj.name, obj.steamid, obj.password], function(err) {
		if(err) {
			console.error("Could not create user:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.addFriend = function(user, friend, callback) {
	this.pool.query("INSERT INTO Friends(user, friend) VALUES(?, ?)", [user, friend], function(err) {
		if(err) {
			console.error("Could not add friend:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.removeFriend = function(user, friend, callback) {
	this.pool.query("DELETE FROM Friends WHERE user = ? AND friend = ?", [user, friend], function(err) {
		if(err) {
			console.error("Could not remove friend:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.addAdmin = function(id, callback) {
	this.pool.query("INSERT INTO Admins(user) VALUES(?)", [id], function(err) {
		if(err) {
			console.error("Could not add admin:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.removeAdmin = function(id, callback) {
	this.pool.query("DELETE FROM Admins WHERE user = ?", [id], function(err) {
		if(err) {
			console.error("Could not remove admin:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.enableUser = function(id, callback) {
	this.pool.query("UPDATE Users SET enabled = TRUE WHERE id = ?", [id], function(err) {
		if(err) {
			console.error("Could not enable user:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.disableUser = function(id, callback) {
	this.pool.query("UPDATE Users SET enabled = FALSE WHERE id = ?", [id], function(err) {
		if(err) {
			console.error("Could not disable user:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.validateAdmin = function(id, callback) {
	if(username !== undefined && password !== undefined) {
		this.pool.query("SELECT id FROM Admins WHERE user = ?", [id], function(err, rows) {
			if(err) {
				console.error("Could not validate admin:");
				console.error(err);
				callback(err);
			}
			else {
				callback(undefined, rows !== undefined && rows.length == 1);
			}
		});
	}
	else {
		console.error("Unable to validate user:");
		console.error("either username, password or both were not supplied.");
		callback(err);
	}
};

Database.prototype.getUserByName = function(username, callback) {
	this.pool.query("SELECT id, name, steamid, enabled, password FROM Users WHERE name = ?", [username], function(err, rows) {
		if(err) {
			console.error("Could not get user by username:");
			console.error(err);
			callback(err);
		}
		else {
			if(rows == undefined || rows.length != 1) {
				callback();
			}
			else {
				callback(undefined, rows[0]);
			}
		}
	});
};

Database.prototype.getUserBySteamID = function(steamid, callback) {
	this.pool.query("SELECT id, name, steamid, enabled, password FROM Users WHERE steamid = ?", [steamid], function(err, rows) {
		if(err) {
			console.error("Could not get user by steamid:");
			console.error(err);
			callback(err);
		}
		else {
			if(rows == undefined || rows.length != 1) {
				callback();
			}
			else {
				callback(undefined, rows[0]);
			}
		}
	});
};

Database.prototype.ignoreMarker = function(user, marker, callback) {
	this.pool.query("INSERT INTO MarkerIgnore(user, marker) VALUES(?, ?)", [user, marker], function(err) {
		if(err) {
			console.error("Could not ignore marker:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

module.exports = Database;
