module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Friendships", function() {
		it("can login a second user at the same time", function(done) {
			mockSock2.callMockedListener("login", {name : "Test3", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
				function(answer) {
					answer.okay.should.be.true;
					client2.user.should.not.equal(undefined)
					done();
				}
			);
		});
		it("can add a friend", function(done) {
			mockSock1.callMockedListener("addFriend", client2.user.steamid, function(answer) {
				answer.okay.should.be.true;
				done();
			});
		});
		it("is friend afterwards", function(done) {
			mockSock1.callMockedListener("getUsers", null, function(answer) {
				answer.okay.should.be.true;
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test3") {
						user.friend.should.equal(1);
						user.friendedBy.should.equal(0);
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
						user.friend.should.equal(0);
						user.friendedBy.should.equal(1);
					}
				}
				done();
			});
		});
		it("can add a friend back", function(done) {
			mockSock2.callMockedListener("addFriend", client1.user.steamid, function(answer) {
				answer.okay.should.be.true;
				done();
			});
		});
		it("they are both friends from client1's perspective", function(done) {
			mockSock1.callMockedListener("getUsers", null, function(answer) {
				answer.okay.should.be.true;
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test3") {
						user.friend.should.equal(1);
						user.friendedBy.should.equal(1);
					}
				}
				done();
			});
		});
		it("they are both friends from client2's perspective", function(done) {
			mockSock2.callMockedListener("getUsers", null, function(answer) {
				answer.okay.should.be.true;
				var users = answer.users;
				for(var u in users) {
					var user = users[u];
					if(user.name == "Test1") {
						user.friend.should.equal(1);
						user.friendedBy.should.equal(1);
					}
				}
				done();
			});
		});
	});
};
