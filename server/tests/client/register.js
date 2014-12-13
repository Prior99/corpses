var assert = require("assert");

module.exports = function(client, database, server, mockSock) {
	describe("Register", function() {
		it("can register a non-existing account", function(done) {
			mockSock.callMockedListener("register", {name : "Test5", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				assert(answer);
				assert(server.newUser);
				database.getUserByName("Test5", function(err, user) {
					assert(user.name === "Test5");
					assert(user.steamid == "56789");
					assert(user.password === "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3");
					assert(!user.enabled);
					done();
				});
			});
		});
		it("can't register an existing account", function(done) {
			mockSock.callMockedListener("register", {name : "Test5", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can't register an account with a name shorter than 3 characters", function(done) {
			mockSock.callMockedListener("register", {name : "Ah", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
	});
};
