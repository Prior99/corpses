var assert = require("assert");

module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Friendships", function() {
		it("can login a second user at the same time", function(done) {
			mockSock2.callMockedListener("login", {name : "Test3", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
				function(answer) {
					assert(answer.okay);
					assert(client2.user !== undefined);
					done();
				}
			);
		});
		it("can add a friend", function(done) {
			mockSock1.callMockedListener("addFriend", client2.user.steamid, function(answer) {
				assert(answer.okay);
				done();
			});
		});
		it("is friend afterwards", function(done) {
			mockSock1.callMockedListener("getUsers", null, function(answer) {
				assert(answer.okay);
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test3") {
						assert(user.friend);
						assert(!user.friendedBy);
					}
				}
				done();
			});
		});
		it("is befriended afterwards", function(done) {
			mockSock2.callMockedListener("getUsers", null, function(answer) {
				answer.okay.should.be.true;
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test1") {
						assert(!user.friend);
						assert(user.friendedBy);
					}
				}
				done();
			});
		});
		it("can add a friend back", function(done) {
			mockSock2.callMockedListener("addFriend", client1.user.steamid, function(answer) {
				assert(answer.okay);
				done();
			});
		});
		it("can not add a friend that does not exist", function(done) {
			mockSock2.callMockedListener("addFriend", 45634566, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not remove a friend that does not exist", function(done) {
			mockSock2.callMockedListener("removeFriend", 45634566, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("they are both friends from client1's perspective", function(done) {
			mockSock1.callMockedListener("getUsers", null, function(answer) {
				assert(answer.okay);
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test3") {
						assert(user.friend);
						assert(user.friendedBy);
					}
				}
				done();
			});
		});
		it("they are both friends from client2's perspective", function(done) {
			mockSock2.callMockedListener("getUsers", null, function(answer) {
				assert(answer.okay);
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test1") {
						assert(user.friend);
						assert(user.friendedBy);
					}
				}
				done();
			});
		});
		it("client1 can remove client2 as a friend", function(done) {
			mockSock1.callMockedListener("removeFriend", client2.user.steamid, function(answer) {
				assert(answer.okay);
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test1") {
						assert(!user.friend);
						assert(user.friendedBy);
					}
				}
				done();
			});
		});
		it("client2 can remove client1 as a friend", function(done) {
			mockSock2.callMockedListener("removeFriend", client1.user.steamid, function(answer) {
				assert(answer.okay);
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test3") {
						assert(!user.friend);
						assert(!user.friendedBy);
					}
				}
				done();
			});
		});
		it("they are both not friends anymore from client1's perspective", function(done) {
			mockSock1.callMockedListener("getUsers", null, function(answer) {
				assert(answer.okay);
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test3") {
						assert(!user.friend);
						assert(!user.friendedBy);
					}
				}
				done();
			});
		});
		it("they are both not friends anymore from client2's perspective", function(done) {
			mockSock2.callMockedListener("getUsers", null, function(answer) {
				answer.okay.should.be.true;
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test1") {
						assert(!user.friend);
						assert(!user.friendedBy);
					}
				}
				done();
			});
		});
	});
};
