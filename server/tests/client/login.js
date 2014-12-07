var assert = require("assert");

module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Login", function() {
		it("can login to an existing account", function(done) {
			mockSock1.callMockedListener("login", {name : "Test1", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				assert(answer.okay);
				done();
			});
		});
		it("can not login to an non-existing account", function(done) {
			mockSock1.callMockedListener("login", {name : "Foo", password : "123"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not login with wrong password", function(done) {
			mockSock1.callMockedListener("login", {name : "Test1", password : "5920422f9d417e48f1fa07e998e86f7a6667efdc4fb8a04a1f3ff5a4f7a27ae3"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not login to an disabled account", function(done) {
			mockSock1.callMockedListener("login", {name : "Test2", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("is logged in as Test1 afterwards", function() {
			assert(client1.user.name == "Test1");
			assert(client1.user.id === 1);
		});
		it("can fetch the userdata", function(done) {
			mockSock1.callMockedListener("getUserData", null, function(answer) {
				assert(answer.okay);
				assert.deepEqual(answer.user, client1.user);
				done();
			});
		});
		it("can not run user-commands if not logged in", function(done) {
			mockSock2.callMockedListener("getUserData", null, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
	});
};
