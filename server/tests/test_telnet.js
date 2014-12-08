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
		telnetClient.once("info", function(obj) {
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
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/info.txt"));
	});

	it("emits \"getTime\" when getTime is written", function(done) {
		telnetClient.once("getTime", function(obj) {
			assert.equal(obj.day, 164);
			assert.equal(obj.hour, 8);
			assert.equal(obj.minute, 39);
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/time.txt"));
	});

	it("emits \"listPlayersExtended\" when listPlayersExtended is written", function(done) {
		telnetClient.once("listPlayersExtended", function(players) {
			assert.equal(players.length, 3);
			var p = players[0];
			assert.equal(p.id, 113);
			assert.equal(p.name, "Test1");
			assert.deepEqual(p.position, {x : -8, y : 29.3324234, z : 0});
			assert.deepEqual(p.rotation, {x : -0.6, y : 94.2, z : 0.0});
			assert.equal(p.remote, true);
			assert.equal(p.health, 70);
			assert.equal(p.deaths, 0);
			assert.equal(p.zombieKills, 1682);
			assert.equal(p.playerKills, 6);
			assert.equal(p.score, 3);
			assert.equal(p.steamid, 61725147);
			assert.equal(p.ip, "127.0.0.1");
			assert.equal(p.ping, 3);

			p = players[1];
			assert.equal(p.id, 145);
			assert.equal(p.name, "Bröüä\\ufe3b\\u30c7l");
			assert.deepEqual(p.position, {x : 4.5, y : 0.0, z : 288.8});
			assert.deepEqual(p.rotation, {x : 4334.6, y : 5.2, z : 0.0});
			assert.equal(p.remote, true);
			assert.equal(p.health, 0);
			assert.equal(p.deaths, 3);
			assert.equal(p.zombieKills, 2);
			assert.equal(p.playerKills, 0);
			assert.equal(p.score, 0);
			assert.equal(p.steamid, 7611776561198);
			assert.equal(p.ip, "0.0.0.0");
			assert.equal(p.ping, 100);

			p = players[2];
			assert.equal(p.id, 182);
			assert.equal(p.name, "Sascha");
			assert.deepEqual(p.position, {x : -121234.534, y : 29.3, z : 288.8});
			assert.deepEqual(p.rotation, {x : -1, y : 94.2, z : 0.0});
			assert.equal(p.remote, true);
			assert.equal(p.health, 100);
			assert.equal(p.deaths, 39000);
			assert.equal(p.zombieKills, 162);
			assert.equal(p.playerKills, 1);
			assert.equal(p.score, 1501);
			assert.equal(p.steamid, 61198079807725147);
			assert.equal(p.ip, "1.2.3.4");
			assert.equal(p.ping, 0);
			done();
		});
		socket.write(FS.readFileSync("server/tests/samples/telnet/players.txt"));
	});

	it("can close the server and the telnetClient emits \"close\"", function(done) {
		telnetClient.on("close", function() {
			server.close(function() {
				done();
			});
		});
		socket.end();
	});
});
