/*
 *  This file is part of CORPSES, a webinterface for 7 Days to Die.
 *
 *  CORPSES is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CORPSES is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with CORPSES. If not, see <http://www.gnu.org/licenses/>.
 */
var Winston = require('winston');
var MySQL = require('mysql');

function Database(config) {
	this.pool = MySQL.createPool(config.database);
	Winston.info("Connecting to Database... ");
	this.pool.getConnection(function(err, conn) {
		function checkError(err) {
			if(err) {
				reportError("An error occured when creating the tables", err);
				return false;
			}
			else {
				return true;
			}
		}
		function createUsers() {
			pool.query(
				"CREATE TABLE IF NOT EXISTS Users (" +
				"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
				"name			VARCHAR(128) NOT NULL UNIQUE," +
				"steamid		VARCHAR(128) NOT NULL UNIQUE," +
				"enabled		BOOL," +
				"password		VARCHAR(128) NOT NULL)", function(err) {
					if(checkError(err)) {
						createFriends();
					}
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
						if(checkError(err)) {
							createAdmins();
						}
				});
			}
			function createAdmins() {
				pool.query(
					"CREATE TABLE IF NOT EXISTS Admins (" +
					"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
					"user			INT NOT NULL UNIQUE," +
					"FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE)", function(err) {
						if(checkError(err)) {
							createMarkers();
						}
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
						if(checkError(err)) {
							createMarkerIgnore();
						}
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
						if(checkError(err)) {
							Winston.info("All tables okay.");
						}
				});
			}

	    if(err) {
			Winston.info("Connecting to Database failed.");
	    }
	    else {
	        conn.release();
	        Winston.info("Connecting to Database done.");
			Winston.info("Getting tables ready ... ");
			var pool = this.pool;
			createUsers();
		}
	}.bind(this));
}

var reportError = function(desc, err) {
	Winston.error("Database error: \"" + desc + "\"\n", err);
};

Database.prototype.shutdown = function(callback) {
	this.pool.end(callback);
};

Database.prototype.addMarker = function(obj, author, callback) {
	this.pool.query("INSERT INTO Markers (name, description, lat, lng, icon, visibility, author) VALUES(?, ?, ?, ?, ?, ?, ?)",
		[obj.name, obj.description, obj.lat, obj.lng, obj.icon, obj.visibility, author], function(err, result) {
		if(err) {
			reportError("Unable to create marker", err);
			callback(err);
		}
		else {
			obj.id = result.insertId;
			obj.author = author;
			callback(undefined, obj);
		}
	});
};

Database.prototype.getMarker = function(id, callback) {
	this.pool.query("SELECT id, name, description, lat, lng, icon, visibility, author FROM Markers WHERE id = ?", [id],
		function(err, rows) {
			if(err) {
				reportError("Unable to get marker", err);
				callback(err);
			}
			else {
				if(rows.length > 0) {
					callback(undefined, rows[0]);
				}
				else {
					callback();
				}
			}
		}
	);
};

Database.prototype.removeMarker = function(id, userid, callback) {
	this.pool.query("DELETE FROM Markers WHERE id = ? AND author = ?", [id, userid], function(err) {
		if(err) {
			reportError("Unable to remove marker", err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.validateUser = function(username, password, callback) {
	if(username !== undefined && password !== undefined) {
		this.pool.query("SELECT id FROM Users WHERE name = ? AND password = ? AND (enabled = true OR id = 1)", [username, password], function(err, rows) {
			if(err) {
				reportError("Unable to validate user", err);
				callback(err);
			}
			else {
				callback(undefined, rows !== undefined && rows.length === 1);
			}
		});
	}
	else {
		callback(undefined, false);
	}
};

Database.prototype.areFriends = function(user1, user2, callback) {
	this.pool.query("SELECT " +
						"(" +
							"EXISTS(SELECT id FROM Friends WHERE user = ? AND friend = ?) AND " +
							"EXISTS(SELECT id FROM Friends WHERE friend = ? AND user = ?)" +
						") AS friends ", [user1, user2, user1, user2],
		function(err, rows) {
			if(err) {
				reportError("Unable to check, whether two people are friends", err);
				callback(err);
			}
			else {
				if(rows !== undefined && rows[0].friends) {
					callback(undefined, true);
				}
				else {
					callback(undefined, false);
				}
			}
		}
	);
};

Database.prototype.fetchMarkers = function(id, callback) {
	if(id === undefined) {
		this.pool.query("SELECT id, name, description, lat, lng, visibility, author, icon " +
						"FROM Markers " +
						"WHERE visibility = 'public'", function(err, rows) {
			if(err) {
				reportError("Unable to fetch markers", err);
				callback(err);
			}
			else {
				callback(undefined, rows);
			}
		});
	}
	else {
		this.pool.query("SELECT id, name, description, lat, lng, visibility, author, icon " +
							"FROM Markers " +
							"WHERE author = ? OR (" +
								"visibility = 'public' OR (" +
									"visibility = 'friends' AND " +
									"author IN (SELECT friend FROM Friends WHERE user = ?) AND " +
									"author IN (SELECT user FROM Friends WHERE friend = ?)" +
								")" +
							") AND NOT id IN (SELECT marker FROM MarkerIgnore WHERE user = ?)", [id, id, id, id], function(err, rows) {
			if(err) {
				reportError("Unable to fetch markers", err);
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
			reportError("Could not create user", err);
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
			reportError("Could not add friend", err);
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
			reportError("Could not remove friend", err);
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
			reportError("Could not add admin", err);
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
			reportError("Could not remove admin", err);
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
			reportError("Could not enable user", err);
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
			reportError("Could not disable user", err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

Database.prototype.validateAdmin = function(id, callback) {
	if(id !== undefined) {
		this.pool.query("SELECT id FROM Admins WHERE user = ?", [id], function(err, rows) {
			if(err) {
				reportError("Could not validate admin", err);
				callback(err);
			}
			else {
				callback(undefined, rows !== undefined && rows.length === 1);
			}
		});
	}
	else {
		reportError("Unable to validate user, either username, password or both were not supplied.");
		callback(err);
	}
};

Database.prototype.getUserByName = function(username, callback) {
	this.pool.query("SELECT id, name, steamid, enabled, password, id IN (SELECT user FROM Admins) AS admin FROM Users WHERE name = ?", [username], function(err, rows) {
		if(err) {
			reportError("Could not get user by username", err);
			callback(err);
		}
		else {
			if(rows === undefined || rows.length !== 1) {
				callback();
			}
			else {
				callback(undefined, rows[0]);
			}
		}
	});
};

Database.prototype.getUserBySteamID = function(steamid, callback) {
	this.pool.query("SELECT id, name, steamid, enabled, password, id IN (SELECT user FROM Admins) AS admin FROM Users WHERE steamid = ?", [steamid], function(err, rows) {
		if(err) {
			reportError("Could not get user by steamid", err);
			callback(err);
		}
		else {
			if(rows === undefined || rows.length !== 1) {
				callback();
			}
			else {
				callback(undefined, rows[0]);
			}
		}
	});
};

Database.prototype.getUsers = function(userid, callback) {
	this.pool.query("SELECT u.name AS name, " +
							"u.steamid AS steamid, " +
							"u.enabled AS enabled, " +
							"u.id IN (SELECT friend FROM Friends WHERE user = ?) AS friend, " +
							"u.id IN (SELECT user FROM Friends WHERE friend = ?) AS friendedBy, " +
							"u.id IN (SELECT user FROM Admins) AS admin " +
					"FROM Users u", [userid, userid],
		function(err, rows) {
			if(err) {
				reportError("Could not get users", err);
				callback(err);
			}
			else {
				callback(undefined, rows);
			}
		}
	);
};

Database.prototype.ignoreMarker = function(user, marker, callback) {
	this.pool.query("INSERT INTO MarkerIgnore(user, marker) VALUES(?, ?)", [user, marker], function(err) {
		if(err) {
			reportError("Could not ignore marker", err);
			callback(err);
		}
		else {
			callback(undefined);
		}
	});
};

module.exports = Database;
