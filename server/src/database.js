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
var FS = require("fs");

/**
 * Open a connection to the database specified in config. If all goes well and
 * provided, callback will be called when the connection was opened and all tables
 * are setup correctly.
 * @constructor
 * @param {object} config - The configuration providing the information on how to connect
 *                          to the database
 * @param {string} config.host - The host of the database.
 * @param {string} config.user - The user to use to connect to the database.
 * @param {string} config.password - The password to use while connecting.
 * @param {string} config.database - The database to connect to.
 * @param {requestCallback} [callback] - Will be called once the connection is opened
 * 										 and the database is fully usable.
 */
function Database(config, callback) {
	this.pool = MySQL.createPool({
		host : config.host,
		user : config.user,
		password : config.password,
		database : config.database,
		multipleStatements : true,
		connectTimeout : config.connectTimeout ? config.connectTimeout : 4000
	});
	Winston.info("Connecting to Database... ");
	this.pool.getConnection(function(err, conn) {
		if(err) {
			Winston.error("Connecting to Database failed.");
			Winston.error(err);
			if(callback) {
				callback(false);
			}
		}
		else {
			conn.release();
			Winston.info("Connecting to Database done.");
			Winston.info("Getting tables ready ... ");
			var pool = this.pool;
			FS.readFile("server/database.sql", {encoding : "utf8"}, function(err, data) {
				if(err) {
					Winston.error("Could not read file for database configuration.");
					if(callback) {
						callback(false);
					}
				}
				else {
					pool.query(data, function(err) {
						if(err) {
							Winston.error("An error occured while configuring database:" + err);
							if(callback) {
								callback(false);
							}
						}
						else {
							Winston.info("All tables okay.");
							if(callback) {
								callback(true);
							}
						}
					});
				}
			});
		}
	}.bind(this));
}

var reportError = function(desc, err) {
	Winston.error("Database error: \"" + desc + "\"\n" + err);
};

/**
 * Will shutdown the database and end all current connections.
 * @param {requestCallback} [callback] - Called once the connection is down.
 */
Database.prototype.shutdown = function(callback) {
	this.pool.end(callback);
};

/**
 * Add a marker to the database.
 * @param {object} obj - Information about the marker to store
 * @param {string} obj.name - Name of the marker
 * @param {string} obj.description - Description of the marker
 * @param {number} obj.lat - Latitude of the marker
 * @param {number} obj.lng - Longitude of the marker
 * @param {string} obj.icon - Icon of the marker (font awesome id)
 * @param {string} obj.visibility - Visibility of the marker ('public', 'friends' or 'private')
 * @param {number} author - The database id of the author of this marker
 * @param {Database~MarkerCallback} callback - called when the marker was added
 */
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

/**
 * Will return a marker which is identified by the supplied id.
 * @param {number} id - Id of the marker to look up
 * @param {Database~MarkerCallback} callback - called when query suceeded
 */
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

/**
 * Remove a marker specified by its id from the database if the userid is authorized to do so.
 * @param {number} id - Id of the marker to delete.
 * @param {number} userid - Id of the user that tries to remove the marker. This
 * 							will only suceed if the user is the author of the marker.
 * @param {Database~VoidCallback} callback - Called once the query is done.
 */
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

/**
 * Validates that a user with the given username and password exists.
 * @param {string} username - The username of the user to validate
 * @param {string} password - The SHA-128 checksum of the users password
 * @param {Database~ValidationCallback} callback - Called when the query has completed.
 */
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
		callback(true);
	}
};

/**
 * Checks whether two users are friends. This implies that both users have added
 * each other as friends and not just one of them.
 * @param {number} user1 - Id of the first user
 * @param {number} user2 - Id of the other user
 * @param {Database~ValidationCallback} callback - Called when the query was finished
 */
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
/**
 * Called once the database finished something and a marker was returned.
 * @callback Database~MarkerCallback
 * @param {object} error - If this is not undefined it contains an error thrown
 *						   from the database
 * @param {Database~Marker} result - If the request succeeded, this contains an object
 * 							with information about the marker.
 */
/**
 * A user.
 * @typedef {object} Database~User
 * @property {string} name - Name of the user
 * @property {string} steamid - Steam64 Id of the user used to associate him with an
 *							   ingame player.
 * @property {boolean} enabled - True if the user is enabled.
 * @property {string} password - The password of the user as SHA-128 checksum.
 * @property {number} id - Databaseid of the user.
 */
/**
 * Called when the database is done looking up or creating a user.
 * @callback Database~UserCallback
 * @param {object} error - If this is not undefined it contains an error thrown
 *						   from the database.
 * @param {Database~User} user - The user that was found or undefined if no user
 *								 was found.
 */
/**
 * Called when the database is done validating something.
 * @callback Database~ValidationCallback
 * @param {object} error - If this is not undefined it contains an error thrown
 *						   from the database.
 * @param {boolean} result - True if the user that was tested is an admin.
 */
/**
 * Called when the database is done performing an action without a return value.
 * @callback Database~VoidCallback
 * @param {object} error - If this is not undefined it contains an error thrown
 *						   from the database.
 */
/**
 * A single marker.
 * @typedef {object} Database~Marker
 * @property {string} name - Name of the marker
 * @property {string} description - Description of the marker
 * @property {number} lat - Latitude of the marker
 * @property {number} lng - Longitude of the marker
 * @property {string} icon - Icon of the marker (font awesome id)
 * @property {string} visibility - Visibility of the marker ('public', 'friends' or 'private')
 * @property {number} id - Database id of the created marker
 * @property {number} author - Author of the marker.
 */
/**
 * Called when fetching markers was done.
 * @callback Database~MarkersCallback
 * @param {object} error - If this is not undefined it contains an error thrown
 *						   from the database.
 * @param {Database~Marker[]} markers - Markers that were found.
 */

/**
 * Will fetch all markers either specific for the supplied user or for the public.
 * @param {number} id - Id of the user to fetch the markers for or undefined if
 *						only public markers should be fetched.
 * @param {Database~MarkersCallback} callback - Called on query finished.
 */
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


/**
 * Add a user to the database.
 * @param {object} obj - The user to add
 * @param {string} obj.name - The users name
 * @param {string} obj.password - The SHA-128 checksum of the users password
 * @param {string} obj.steamid - The steam64 id of the user used to associate him
 *								 with the correpsonding ingame player.
 * @param {Database~VoidCallback} callback - Called on query done.
 */
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


/**
 * Add a friend.
 * @param {number} user - Id of the user that wants to add a friend
 * @param {number} friend - Id of the user the first user wants to add as a friend
 * @param {Database~VoidCallback} - Called when the query was done.
 */
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

/**
 * Remove a friend.
 * @param {number} user - Id of the user that wants to remove a friend
 * @param {number} friend - Id of the user the first user wants to remove as a friend
 * @param {Database~VoidCallback} - Called when the query was done.
 */
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

/**
 * Add a user as admin.
 * @param {number} id - Id of the user to add as admin.
 * @param {Database~VoidCallback} callback - Called when query was finished.
 */
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

/**
 * Remove a user as admin.
 * @param {number} id - Id of the user to remove as admin.
 * @param {Database~VoidCallback} callback - Called when query was finished.
 */
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

/**
 * Enable a user.
 * @param {number} id - Id of the user to enable.
 * @param {Database~VoidCallback} - Called when the query was done.
 */
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

/**
 * Disable a user.
 * @param {number} id - Id of the user to disable.
 * @param {Database~VoidCallback} - Called when the query was done.
 */
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

/**
 * Validate if a user is an admin.
 * @param {number} id - Id of the user to test.
 * @param {Database~ValidationCallback} callback - Called when the database
 * 												   is done.
 */
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
		reportError("Unable to validate admin, either username, password or both were not supplied.");
		callback(true);
	}
};

/**
 * Look up a user by name.
 * @param {string} username - The name of the user to look up.
 * @param {Database~UserCallback} callback - Called when the lookup has finished.
 */
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

/**
 * Look up a user by his steamid.
 * @param {string} steamid - The steamid to look up.
 * @param {Database~UserCallback} - Called when the query was done.
 */
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

/**
 * A user from the view of another user.
 * @typedef {object} Database~UserSpecificUser
 * @property {string} name - Name of the user.
 * @property {string} steamid - Steam64 Id of the user.
 * @property {boolean} enabled - Whether the user is enabled or whether not.
 * @property {boolean} friend - Whether this user is friend of the other user.
 * @property {boolean} friendedBy - Whether this users befriended the other user.
 * @property {boolean} admin - If the user is admin, this is true.
 */
/**
 * Called once the database finished looking up all users specific to one user.
 * @callback Database~UsersCallback
 * @param {object} error - If this is not undefined it contains an error thrown
 *						   from the database
 * @param {Database~UserSpecificUser[]} users - All users that were found.
 */
/**
 * Fetches all users from the perspective of a specific users. This means that
 * all users will have relationships specific to this user.
 * @param {number} userid - Id of the user that wants to look up all other users.
 * @param {Database~UsersCallback} callback - Called once the query was done.
 */
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

/**
 * Will make a user ignore a specific marker.
 * @param {number} user - Id of the user that wants to ignore a marker.
 * @param {number} marker - Id of the marker the user wants to ignore.
 * @param {Database~VoidCallback} - Called once the database finished.
 */
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
