module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Adding Markers", function() {
		it("can login a second user at the same time", function(done) {
			mockSock2.callMockedListener("login", {name : "Test3", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
				function(answer) {
					answer.okay.should.be.true;
					done();
				}
			);
		});
		it("can add a public marker", function(done) {
			mockSock1.callMockedListener("addMarker", {
				name : "Testmarker",
				lat : 10.3,
				lng : -9.4,
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'public'}, function(answer) {
					answer.okay.should.be.true;
					var msg = mockSock2.lastMsg;
					should.not.equal(msg, undefined);
					msg.key.should.eql("marker");
					done();
				}
			);
		});
		it("can add a private marker", function(done) {
			mockSock1.callMockedListener("addMarker", {
				name : "Testmarker",
				lat : 10.3,
				lng : -9.4,
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'private'}, function(answer) {
					answer.okay.should.be.true;
					server.sentMarker.should.be.false;
					server.sentMarker = false;
					done();
				}
			);
		});
		it("can add a friends-only marker", function(done) {
			mockSock1.callMockedListener("addMarker", {
				name : "Testmarker",
				lat : 10.3,
				lng : -9.4,
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'friends'}, function(answer) {
					answer.okay.should.be.true;
					var msg = mockSock2.lastMsg;
					should.not.equal(msg, undefined);
					msg.key.should.eql("marker");
					done();
				}
			);
		});
	});
};
