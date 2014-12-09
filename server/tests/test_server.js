var assert = require("assert");
var Winston = require('winston');
var net = require("net");

var Server = require("../src/server.js");
var TelnetClient = require("../src/7dtd.js");
var Database = require("../src/database.js");
var Cache = require("../src/cache.js");
var config = require("./config.json");

var cache = new Cache({time : 5000, knownPlayers : 10000, playersExtended : 1000});

var socket;
var theServer;
var server = net.createServer(function(sock) {
	socket = sock;
});
server.listen(config.port);

var telnetClient = new TelnetClient({
	"telnetPort" : config.port,
	"telnetHost" : "localhost"
});
var database = new Database(config);

describe('The server itself', function() {
	it("can start without crashing", function() {
		theServer = new Server(cache, telnetClient, database, config);
		theServer.once("started", function() {
			done();
		});
	});

	it("can stop everything", function() {
		theServer.shutdown();
		theServer.once("stopped", function() {
			server.close(function() {
				done();
			});
			socket.end();
			done();
		});
	});
});
