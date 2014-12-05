var assert = require("assert");

describe('The cache holding the information from the 7DTD server', function() {
	var sample = require("./samples/telnet_sampledata1.js");
	var handlers = [];
	var handlerMap = {};
	var triggerGetTime = false;
	var triggerListKnownPlayers = false;
	var triggerListPlayersExtended = false;
	var mockTelnet = {
		on : function(string, callback) {
			handlers.push(string);
			handlerMap[string] = callback;
		},
		triggerGetTime : function() {
			triggerGetTime = true;
			handlerMap["getTime"](sample.time);
		},
		triggerListKnownPlayers : function() {
			triggerListKnownPlayers = true;
			handlerMap["listKnownPlayers"](sample.knownPlayers);
		},
		triggerListPlayersExtended : function() {
			triggerListPlayersExtended = true;
			handlerMap["listPlayersExtended"](sample.listPlayersExtended);
		}
	};
	var Cache = require("../src/cache.js");
	var cache = new Cache({time : 30, knownPlayers : 40, playersExtended : 50});
	cache.connectionEstablished(mockTelnet);
	setTimeout(function() {
		handlerMap["info"](sample.info);
	}, 80);
	it("registers four handlers", function() {
		assert(handlers.indexOf("getTime") !== -1);
		assert(handlers.indexOf("listKnownPlayers") !== -1);
		assert(handlers.indexOf("listPlayersExtended") !== -1);
		assert(handlers.indexOf("info") !== -1);
	});
	it("has triggered three events after one second", function(done) {
		setTimeout(function() {
			assert(triggerGetTime);
			assert(triggerListKnownPlayers);
			assert(triggerListPlayersExtended);
			done();
		}, 100);
	});
	it("saves the output of all four events consistently", function(done) {
		setTimeout(function() {
			assert(cache.time === sample.time);
			assert(cache.knownPlayers === sample.knownPlayers);
			assert(cache.playersExtended === sample.listPlayersExtended);
			assert(cache.info === sample.info);
			done();
		}, 100);
	});
	it("has no longer triggered something after disconnect", function(done) {
		setTimeout(function() {
			cache.connectionLost();
			triggerGetTime = false;
			triggerListKnownPlayers = false;
			triggerListPlayersExtended = false;
			setTimeout(function() {
				assert(triggerGetTime === false);
				assert(triggerListKnownPlayers === false);
				assert(triggerListPlayersExtended === false);
				done();
			}, 200);
		}, 150);
	});
});
