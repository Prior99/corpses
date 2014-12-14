var assert = require("assert");
var Winston = require('winston');
var net = require("net");
var WS = require("ws");
var FS = require("fs");

var Websocket = require("../src/websocket_server.js");
var Server = require("../src/server.js");
var TelnetClient = require("../src/telnetclient.js");
var Database = require("../src/database.js");
var Cache = require("../src/cache.js");
var config = require("./config.json");

var cache = new Cache({time : 500000, knownPlayers : 1000000, playersExtended : 100000});

var socket;
var theServer;
var server;
var telnetClient;
var websocket;
var ws;
var database;

describe('The server', function() {

	it("can setup a mocked 7dtd testserver", function(done) {
		FS.unlink(config.clientDirectory + "/map", function() {
			database = new Database(config.database, function() {
				server = net.createServer(function(sock) {
					socket = sock;
					socket.setEncoding("utf8");
					socket.once("data", function(msg) {

					});

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
		});
	});

	it("can start without crashing", function(done) {
		theServer = new Server(cache, telnetClient, database, config);
		theServer.once("started", function() {
			done();
		});
		telnetClient.connect();
	});

	it("can not start the websocketserver twice", function(done) {
		var server2 = new Server(cache, telnetClient, database, config);
		server2._startWebsocketServer();
		server2.once("error", function() {
			done();
		});
	});

	it("can not start the websocketserver if the clientdirectory is not accessible", function(done) {
		FS.renameSync(theServer.config.clientDirectory, theServer.config.clientDirectory + ".tmp");
		theServer.once("error", function() {
			FS.renameSync(theServer.config.clientDirectory + ".tmp", theServer.config.clientDirectory);
			done();
		});
		theServer._startWebsocketServer();
	});

	it("will throw an error if it can not symlink the map for another reason as that the link already exists", function(done) {
		FS.renameSync(theServer.config.clientDirectory, theServer.config.clientDirectory + ".tmp");
		theServer.once("error", function() {
			FS.renameSync(theServer.config.clientDirectory + ".tmp", theServer.config.clientDirectory);
			done();
		});
		theServer._symlinkMap();
	});

	it("does not crash when removing an unknown client", function() {
		theServer.removeClient({ });
	});

	it("can react properly to a connecting client", function(done) {
		ws = new WS("http://localhost:" + config.websocketPort + "/")
		websocket = new Websocket(ws);
		done();
	});

	it("will broadcast playerConnected on player joined", function(done) {
		websocket.addListener("playerConnected", function() {
			websocket.removeListener("playerConnected");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/playerjoined.txt"));
	});

	it("will broadcast playerConnected on player joined with kickUnregistered off", function(done) {
		theServer.config.kickUnregistered = undefined;
		websocket.addListener("playerConnected", function() {
			websocket.removeListener("playerConnected");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/playerjoined.txt"));
	});

	it("will broadcast playerSetOnline on player joined", function(done) {
		websocket.addListener("playerSetOnline", function() {
			websocket.removeListener("playerSetOnline");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/playerjoined.txt"));
	});

	it("will broadcast playerDisconnected when player left", function(done) {
		websocket.addListener("playerDisconnected", function() {
			websocket.removeListener("playerDisconnected");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/playerleft.txt"));
	});

	it("will broadcast playerSetOffline when player left", function(done) {
		websocket.addListener("playerSetOffline", function() {
		websocket.removeListener("playerSetOffline");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/playerleft.txt"));
	});

	it("will broadcast correct updated on time", function(done) {
		websocket.addListener("updated", function(obj) {
			websocket.removeListener("updated");
			assert.equal(obj, "time");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/time.txt"));
	});

	it("will broadcast correct updated on knownPlayers", function(done) {
		websocket.addListener("updated", function(obj) {
			websocket.removeListener("updated");
			assert.equal(obj, "knownPlayers");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/knownplayers.txt"));
	});

	it("will broadcast correct updated on info", function(done) {
		websocket.addListener("updated", function(obj) {
			websocket.removeListener("updated");
			assert.equal(obj, "info");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/info.txt"));
	});

	it("will broadcast correct updated on playersExtended", function(done) {
		websocket.addListener("updated", function(obj) {
			websocket.removeListener("updated");
			assert.equal(obj, "playersExtended");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/players.txt"));
	});

	it("will broadcast correct on spawningWanderingHorde", function(done) {
		websocket.addListener("spawningWanderingHorde", function(obj) {
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/spawninghorde.txt"));
	});

	it("will kick unregistered players", function(done) {
		config.kickUnregistered = true;
		socket.once("data", function(msg) {
			assert.equal(msg, "kick Sascha You must have an enabled account on example.org to play on this server\n");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/playerjoined.txt"));
	});

	it("will not kick registered players", function(done) {
		config.kickUnregistered = true;
		websocket.addListener("playerConnected", function() {
			websocket.removeListener("playerConnected");
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/playerknownjoined.txt"));
	});

	it("can notify about a new user", function(done) {
		websocket.addListener("updated", function(answer) {
			assert(answer === "users");
			websocket.removeListener("updated");
			done();
		});
		theServer.notifyNewUser();
	});

	it("can broadcast to a particular user", function(done) {
		websocket.send("login", { name : "Test1", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
			assert(answer.okay);
			websocket.addListener("test1", function(obj) {
				websocket.removeListener("test1");
				assert(obj === 5);
				done();
			});
			theServer.broadcastToUser(345, "test1", 5);
		});
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
