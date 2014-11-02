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
			this.pool.query(
				"CREATE TABLE IF NOT EXISTS Markers (" +
					"id				INT NOT NULL PRIMARY KEY AUTO_INCREMENT," +
					"name			VARCHAR(128) NOT NULL," +
					"description	TEXT," +
					"lat			FLOAT NOT NULL," +
					"lng			FLOAT NOT NULL," +
					"icon			VARCHAR(32) NOT NULL)",
				function(err) {
					if(err) {
						console.log("Failed:");
						console.error(err);
					}
					else {
						console.log("Okay.");
					}
				}
			);
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
}

Database.prototype.fetchMarkers = function(callback) {
	this.pool.query("SELECT id, name, description, lat, lng, icon FROM Markers", function(err, rows) {
		if(err) {
			console.error("Unable to fetch Markers:");
			console.error(err);
			callback(err);
		}
		else {
			callback(undefined, rows);
		}
	});
};

module.exports = Database;
