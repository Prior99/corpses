var assert = require("assert");

module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Admin", function() {
		it("can not enable users if not an admin", function(done) {
			mockSock2.callMockedListener("login", {name : "Test3", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
				function(answer) {
					assert(answer.okay);
					mockSock2.callMockedListener("enableUser", 234, function(answer) {
						assert(!answer.okay);
						mockSock2.callMockedListener("login", {name : "Test2", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
							function(answer) {
								assert(!answer.okay);
								done();
							}
						);
					});
				}
			);
		});
		it("can not disable users if not an admin", function(done) {
			mockSock2.callMockedListener("disableUser", 345, function(answer) {
				assert(!answer.okay);
				mockSock1.callMockedListener("login", {name : "Test1", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
					function(answer) {
						assert(answer.okay);
						done();
					}
				);
			});
		});
		it("can not add admins if not an admin", function(done) {
			mockSock2.callMockedListener("addAdmin", 123, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not remove admins if not an admin", function(done) {
			mockSock2.callMockedListener("removeAdmin", 345, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can enable an user if admin", function(done) {
			mockSock1.callMockedListener("enableUser", 234, function(answer) {
				assert(answer.okay);
				mockSock2.callMockedListener("login", {name : "Test2", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
					function(answer) {
						assert(answer.okay);
						done();
					}
				);
			});
		});
		it("can add an admin an user if admin", function(done) {
			mockSock1.callMockedListener("addAdmin", 234, function(answer) {
				assert(answer.okay);
				mockSock2.callMockedListener("addAdmin", 123,
					function(answer) {
						assert(answer.okay);
						done();
					}
				);
			});
		});
		it("can remove an admin if user is admin", function(done) {
			mockSock1.callMockedListener("removeAdmin", 234, function(answer) {
				assert(answer.okay);
				mockSock2.callMockedListener("disableUser", 345, function(answer) {
					assert(!answer.okay);
					done();
				});
			});
		});
		it("can disable an user if user is admin", function(done) {
			mockSock1.callMockedListener("disableUser", 234, function(answer) {
				assert(answer.okay);
				mockSock2.callMockedListener("login", {name : "Test2", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
					function(answer) {
						assert(!answer.okay);
						done();
					}
				);
			});
		});
		it("the user with the id 1 is always enabled and admin", function(done) {
			mockSock1.callMockedListener("disableUser", 345, function(answer) {
				assert(answer.okay);
				mockSock1.callMockedListener("removeAdmin", 345, function(answer) {
					assert(answer.okay);
					mockSock1.callMockedListener("login", {name : "Test1", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
						function(answer) {
							assert(answer.okay);
							done();
						}
					);
				});
			});
		});
	});
};
