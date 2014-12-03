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
	it("should register four handlers", function() {
		handlers.indexOf("getTime").should.not.equal(-1);
		handlers.indexOf("listKnownPlayers").should.not.equal(-1);
		handlers.indexOf("listPlayersExtended").should.not.equal(-1);
		handlers.indexOf("info").should.not.equal(-1);
	});
	it("should have triggered three events after one second", function(done) {
		setTimeout(function() {
			triggerGetTime.should.be.true;
			triggerListKnownPlayers.should.be.true;
			triggerListPlayersExtended.should.be.true;
			done();
		}, 100);
	});
	it("should save the output of all four events consistently", function(done) {
		setTimeout(function() {
			cache.time.should.eql(sample.time);
			cache.knownPlayers.should.eql(sample.knownPlayers);
			cache.playersExtended.should.eql(sample.listPlayersExtended);
			cache.info.should.eql(sample.info);
			done();
		}, 100);
	});
	it("should have no longer triggered something after disconnect", function(done) {
		setTimeout(function() {
			cache.connectionLost();
			triggerGetTime = false;
			triggerListKnownPlayers = false;
			triggerListPlayersExtended = false;
			setTimeout(function() {
				triggerGetTime.should.be.false;
				triggerListKnownPlayers.should.be.false;
				triggerListPlayersExtended.should.be.false;
				done();
			}, 200);
		}, 150);
	});
});
