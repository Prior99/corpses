var assert = require("assert");
var Websocket = require("../src/websocket_server.js");
var WS = require("ws");
var Config = require("./config.json");
describe("The websocketwrapper", function() {
	var websocket1, websocket2;
	var ws1, ws2;
	it("can setup a server and a client can connect to it", function(done) {
		wsServer = new WS.Server({
			host : "0.0.0.0",
			port : Config.port
		}).on("connection", function(ws1) {
			websocket1 = new Websocket(ws1);
			done();
		});
		ws2 = new WS("http://localhost:" + Config.port + "/");
		websocket2 = new Websocket(ws2);
	});
	it("can register a sync listener on a websocket and receive a message", function() {
		websocket1.addListener("test1", function(number) {
			return number + 1;
		});
		websocket2.send("test1", 3, function(number) {
			assert(number === 4);
		});
	});
	it("can register an async listener on a websocket and receive a message", function() {
		websocket1.addListener("test1", function(number, async) {
			 async(number + 1);
		}, true);
		websocket2.send("test1", 3, function(number) {
			assert(number === 4);
		});
	});
	it("can add a close listener which will be called when remote closed", function(done) {
		websocket1.addCloseListener(function() {
			done();
		});
		ws2.close();
	});
	it("stays stable when received a broken packet which is not even an object", function(done) {
		wsServer.close();
		wsServer = new WS.Server({
			host : "0.0.0.0",
			port : Config.port
		}).on("connection", function(ws1) {
			websocket1 = new Websocket(ws1);
			setTimeout(function() {
				done();
			}, 30);
			ws1.on("error", function(err) {
				assert(false);
			});
			ws2.on("open", function() {
				ws2.send(JSON.stringify(3));
			});
		});
		ws2 = new WS("http://localhost:" + Config.port + "/");
	});
	it("stays stable when received a broken packet with missing parameters", function(done) {
		ws2.send(JSON.stringify({
			param : 3
		}));
		setTimeout(function() {
			done();
		}, 30);
	});
	it("stays stable when received a broken packet with a wrong type", function(done) {
		ws2.send(JSON.stringify({
			type : "test",
			key : "test1",
			id : 5,
			param : 3
		}));
		setTimeout(function() {
			done();
		}, 30);
	});
	it("stays stable when received a packet which is not even json", function(done) {
		ws2.send(9);
		setTimeout(function() {
			done();
		}, 30);
	});
});
