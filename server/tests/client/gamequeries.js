var assert = require("assert");

module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Gamequeries", function() {
		it("can fetch the time", function(done) {
			mockSock1.callMockedListener("getTime", null, function(answer) {
				assert.deepEqual(answer, server.cache.time);
				done();
			});
		});
		it("can fetch the info", function(done) {
			mockSock1.callMockedListener("getInfo", null, function(answer) {
				assert.deepEqual(answer, server.cache.info);
				done();
			});
		});
		it("can fetch the known players", function(done) {
			mockSock1.callMockedListener("getKnownPlayers", null, function(answer) {
				assert.deepEqual(answer, server.cache.knownPlayers);
				done();
			});
		});
		it("can login a second user at the same time", function(done) {
			mockSock2.callMockedListener("login", {name : "Test3", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
				function(answer) {
					assert(answer.okay);
					done();
				}
			);
		});
		it("can add a friend", function(done) {
			mockSock1.callMockedListener("addFriend", client2.user.steamid, function() {
				mockSock2.callMockedListener("addFriend", client1.user.steamid, function() {
					done();
				});
			});
		});
		it("are friends afterwards", function(done) {
			database.areFriends(client1.user.id, client2.user.id, function(err, okay) {
				assert(okay && !err);
				done();
			});
		});
		it("can fetch the extended players and sees his friends", function(done) {
			mockSock1.callMockedListener("getPlayers", null, function(answer) {
				assert(answer.okay);
				assert(answer.players.length == 2);
				done();
			});
		});
	});
};
