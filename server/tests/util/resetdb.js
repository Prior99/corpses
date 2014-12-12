var dbConfig = require("../config.json");
var MySQL = require('mysql');
var FS = require("fs");

var sqlDrop = FS.readFileSync("server/tests/samples/delete_database.sql", {encoding : "utf8"});
var sqlCreate = FS.readFileSync("server/database.sql", {encoding : "utf8"});
var sqlPrepare = FS.readFileSync("server/tests/samples/prepare_database.sql", {encoding : "utf8"});

function runConnection(sql, done) {
	var connection = MySQL.createConnection(dbConfig.database);
	connection.connect(function(err) {
		if(err) {
			console.error(err);
		}
		connection.query(sql, function(err) {
			if(err) if(err) {
				console.error(err);
			}
			connection.end(function(err) {
				if(err) if(err) {
					console.error(err);
				}
				done();
			});
		});
	});
};

module.exports = {
	createDatabase : function(done) {
		runConnection(sqlCreate, done);
	},
	purgeDatabase : function(done) {
		runConnection(sqlDrop, done);
	},
	prepareDatabase : function(done) {
		runConnection(sqlPrepare, done);
	},
};
