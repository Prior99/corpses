var assert = require("assert");

module.exports = function(client, database, server, mockSock) {
	describe("Login", function() {
		it("can login to an existing account", function(done) {
			mockSock.callMockedListener("login", {name : "Test1", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				assert(answer.okay);
				done();
			});
		});
		it("can not login to an non-existing account", function(done) {
			mockSock.callMockedListener("login", {name : "Foo", password : "123"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not login with wrong password", function(done) {
			mockSock.callMockedListener("login", {name : "Test1", password : "5920422f9d417e48f1fa07e998e86f7a6667efdc4fb8a04a1f3ff5a4f7a27ae3"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not login to an disabled account", function(done) {
			mockSock.callMockedListener("login", {name : "Test2", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("is logged in as Test1 afterwards", function() {
			assert(client.user.name == "Test1");
			assert(client.user.id === 1);
		});
	});
};
