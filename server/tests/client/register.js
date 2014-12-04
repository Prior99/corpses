module.exports = function(client, database, server, mockSock) {
	describe("Register", function() {
		it("can register a non-existing account", function(done) {
			mockSock.callMockedListener("register", {name : "Test5", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.true;
				server.newUser.should.be.true;
				database.getUserByName("Test5", function(err, user) {
					user.name.should.equal("Test5");
					user.steamid.should.equal("56789");
					user.password.should.equal("a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3");
					user.enabled.should.eql(0);
					done();
				});
			});
		});
		it("can't register an existing account", function(done) {
			mockSock.callMockedListener("register", {name : "Test5", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.false;
				done();
			});
		});
		it("can't register an account with a name shorter than 3 characters", function(done) {
			mockSock.callMockedListener("register", {name : "Ah", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.false;
				done();
			});
		});
	});
};
