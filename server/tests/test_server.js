var assert = require("assert");
var Winston = require('winston');
var net = require("net");
var WS = require("ws");
var FS = require("fs");

var Websocket = require("../src/websocket_server.js");
var Server = require("../src/server.js");
var TelnetClient = require("../src/7dtd.js");
var Database = require("../src/database.js");
var Cache = require("../src/cache.js");
var config = require("./config.json");

var cache = new Cache({time : 5000, knownPlayers : 10000, playersExtended : 1000});

var socket;
var theServer;
var server;
var telnetClient;
var websocket;
var ws;

var database = new Database(config);

describe('The server itself', function() {
	it("can setup a mocked 7dtd testserver", function(done) {
		server = net.createServer(function(sock) {
			socket = sock;
		});
		server.listen(config.port);
		telnetClient = new TelnetClient({
			"telnetPort" : config.port,
			"telnetHost" : "localhost"
		});
		server.once("listening", function() {
			done();
		});
	});

	it("can start without crashing", function(done) {
		theServer = new Server(cache, telnetClient, database, config);
		theServer.once("started", function() {
			done();
		});
		telnetClient.connect();
	});

	it("can react properly to a connecting client", function(done) {
		ws = new WS("http://localhost:" + config.websocketPort + "/")
		websocket = new Websocket(ws);
		done();
	});


	it("can broadcast some events", function(done) {
		function testConnect() {
			websocket.addListener("playerConnected", function() {
				testSetOnline();
			});
			socket.write(FS.readFileSync("server/tests/samples/telnet/playerjoined.txt"));
		}
		function testSetOnline() {
			websocket.addListener("playerSetOnline", function() {
				testDisconnect();
			});
			socket.write(FS.readFileSync("server/tests/samples/telnet/playerjoined.txt"));
		}
		function testDisconnect() {
			websocket.addListener("playerDisconnect", function() {
				testDisconnect();
			});
			socket.write(FS.readFileSync("server/tests/samples/telnet/playerleft.txt"));
		}
		function testSetOffline() {
			websocket.addListener("playerSetOffline", function() {
				done();
			});
			socket.write(FS.readFileSync("server/tests/samples/telnet/playerleft.txt"));
		}
		testConnect();
	});

	it("can stop everything", function(done) {
		theServer.shutdown();
		theServer.once("stopped", function() {
			server.close(function() {
				done();
			});
			socket.end();
		});
	});
});
