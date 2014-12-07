var assert = require("assert");
var Websocket = require("../src/websocket_server.js");
var WS = require("ws");
var Config = require("./config.json");
describe("The websocketwrapper", function() {
	var websocket1;
	var websocket2;
	it("can setup a server and a client can connect to it", function(done) {
		wsServer = new WS.Server({
			host : "0.0.0.0",
			port : Config.port
		}).on("connection", function(ws) {
			websocket1 = new Websocket(ws);
			done();
		});
		websocket2 = new Websocket(new WS("http://localhost:" + Config.port + "/"));
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

});
