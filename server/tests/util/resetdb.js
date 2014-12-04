var dbConfig = require("../config.json");
var MySQL = require('mysql');
var FS = require("fs");

module.exports = function(done) {
	var sql = FS.readFileSync("server/tests/samples/database.sql", {encoding : "utf8"});
	var connection = MySQL.createConnection(dbConfig.database);
	connection.connect(function(err) { if(err) throw err; });
	connection.query(sql, function(err, rows, fields) { if(err) throw err; });
	connection.end(function(err) {
		if(err) throw err;
		done();
	});
}
