var assert = require("assert");
var Config = require("./config.json");
var TelnetClient = require("../src/7dtd.js");
var net = require("net");
var FS = require("fs");

describe("The interconnect to the 7DTD-Server", function() {
	var server;
	var socket;
	var called = false;
	var telnetClient;
	function allListeners() {
		called = true;
	};
	function checkCalled() {
		var c = called;
		called = false;
		return c;
	};
	it("can setup a server for testing and the interconnect can reach it", function(done) {
		server = net.createServer(function(sock) {
			socket = sock;
		});
		server.listen(Config.port);
		telnetClient = new TelnetClient({
			telnetPort : Config.port,
			telnetHost : "localhost"
		});
		telnetClient.on("open", function() {
			assert(socket);
			telnetClient.on("info", allListeners);
			telnetClient.on("spawningWanderingHorde", allListeners);
			telnetClient.on("listKnownPlayers", allListeners);
			telnetClient.on("getTime", allListeners);
			telnetClient.on("listPlayersExtended", allListeners);
			telnetClient.on("playerConnected", allListeners);
			telnetClient.on("playerDisconnected", allListeners);
			telnetClient.on("playerSetOnline", allListeners);
			telnetClient.on("playerSetOffline", allListeners);
			done();
		});
	});

	it("ignores the initial greeting sent from the server", function(done) {
		socket.write(FS.readFileSync("server/tests/samples/telnet/startup.txt"), function() {
			setTimeout(function() {
				assert(!checkCalled());
				done();
			}, 20);
		});
	});

	it("emits \"info\" when info is written", function(done) {
		telnetClient.on("info", function(obj) {
			done();
			assert.equal(obj.fps, 40.12);
			assert.equal(obj.worldTime, 7894.44);
			assert.equal(obj.memoryUsed, 200.9);
			assert.equal(obj.memoryMax, 363.3);
			assert.equal(obj.chunks, 1000);
			assert.equal(obj.cgo, 0);
			assert.equal(obj.players, 0);
			assert.equal(obj.zombies, 0);
			assert.equal(obj.entitiesLoaded, 0);
			assert.equal(obj.entitiesOverall, 213);
			assert.equal(obj.items, 37);
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/info.txt"));
	});

	it("can close the server", function() {
		server.close();
	});
});
