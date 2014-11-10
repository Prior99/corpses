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
			function handleError(err) {
				if(err) {
					console.error("An error occured when creating the tables:");
					console.error(err);
				}
			}
			this.pool.query(
				"CREATE TABLE IF NOT EXISTS Markers (" +
					"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
					"name			VARCHAR(128) NOT NULL," +
					"description	TEXT," +
					"lat			FLOAT NOT NULL," +
					"lng			FLOAT NOT NULL," +
					"private		BOOL NOT NULL DEFAULT(FALSE), " +
					"author			INT NOT NULL, " +
					"icon			VARCHAR(32) NOT NULL," +
					"FOREIGN KEY(author) REFERENCES Users(id) ON DELETE CASCADE", handleError);
			this.pool.query(
				"CREATE TABLE IF NOT EXISTS Users (" +
					"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
					"name			VARCHAR(128) NOT NULL UNIQUE," +
					"steamid		VARCHAR(128) NOT NULL UNIQUE," +
					"enabled		BOOL," +
					"password		VARCHAR(128) NOT NULL)", handleError);
			this.pool.query(
				"CREATE TABLE IF NOT EXISTS Friends (" +
					"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
					"user			INT NOT NULL," +
					"friend			INT NOT NULL," +
					"FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE," +
					"FOREIGN KEY(friend) REFERENCES Users(id) ON DELETE CASCADE)", handleError);
			this.pool.query(
				"CREATE TABLE IF NOT EXISTS MarkerIgnore (" +
					"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
					"user			INT NOT NULL," +
					"marker			INT NOT NULL," +
					"FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE," +
					"FOREIGN KEY(marker) REFERENCES Markers(id) ON DELETE CASCADE)", handleError);
			this.pool.query(
				"CREATE TABLE IF NOT EXISTS Admins (" +
					"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
					"user			INT NOT NULL UNIQUE," +
					"FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE)", handleError);
	    }
	}.bind(this));
};

Database.prototype.addMarker = function(obj, callback) {
	this.pool.query("INSERT INTO Markers (name, description, lat, lng, icon) VALUES(?, ?, ?, ?, ?)",
		[obj.name, obj.description, obj.lat, obj.lng, obj.icon], function(err, result) {
		if(err) {
			console.error("Unable to create Marker:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined, obj);
		}
	});
};

Database.prototype.removeMarker = function(id, callback) {
	this.pool.query("DELETE FROM Markers WHERE id = ?", [id], function(err) {
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

Database.prototype.fetchMarkers = function(id, callback) {
	if(id === undefined) {
		this.pool.query("SELECT id, name, description, lat, lng, icon FROM Markers WHERE private = FALSE", function(err, rows) {
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

Database.prototype.addFriend = function(obj, callback) {
	this.pool.query("INSERT INTO Friends(user, friend) VALUES(?, ?)", [obj.user, obj.friend], function(err) {
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

Database.prototype.removeFriend = function(obj, callback) {
	this.pool.query("DELETE FROM Friends WHERE user = ? AND friend = ?", [obj.user, obj.friend], function(err) {
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

Database.prototype.ignoreMarker = function(obj, callback) {
	this.pool.query("INSERT INTO MarkerIgnore(user, marker) VALUES(?, ?)", [obj.user, obj.marker], function(err) {
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
