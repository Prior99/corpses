var assert = require("assert");

module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Adding Markers", function() {
		it("can login a second user at the same time", function(done) {
			mockSock2.callMockedListener("login", {name : "Test3", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
				function(answer) {
					assert(answer.okay);
					done();
				}
			);
		});
		it("can add a public marker", function(done) {
			mockSock1.callMockedListener("addMarker", {
				name : "Testmarker 1",
				lat : 14.3,
				lng : -3.4,
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'public'}, function(answer) {
					assert(answer.okay);
					var msg = mockSock2.lastMsg;
					assert(msg !== undefined);
					assert(msg.key === "marker");
					done();
				}
			);
		});
		it("can add a private marker", function(done) {
			mockSock1.callMockedListener("addMarker", {
				name : "Testmarker 2",
				lat : 10.3,
				lng : -9.47,
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'private'}, function(answer) {
					assert(answer.okay);
					assert(!server.sentMarker);
					server.sentMarker = false;
					done();
				}
			);
		});
		it("can add a friends-only marker and not-friends can not see it", function(done) {
			delete mockSock2.lastMsg;
			mockSock1.callMockedListener("addMarker", {
				name : "Testmarker 3",
				lat : 10.3,
				lng : -90.4,
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'friends'}, function(answer) {
					assert(answer.okay);
					var msg = mockSock2.lastMsg;
					assert(msg === undefined);
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
		})
		it("can add a friends-only marker and friends can see it", function(done) {
			mockSock2.lastMsg = undefined;
			var marker = {
				name : "Testmarker 4",
				lat : 11.3,
				lng : -9.4,
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'friends'
			};
			mockSock1.callMockedListener("addMarker", marker, function(answer) {
					assert(answer.okay);
					var msg = mockSock2.lastMsg;
					assert(msg !== undefined);
					done();
				}
			);
		});
		var markerID;
		it("can fetch markers and see it's own markers", function(done) {
			mockSock1.callMockedListener("fetchMarkers", null, function(answer) {
				assert(answer.okay);
				assert(answer.markers.length === 4);
				markerID = answer.markers[0].id;
				done();
			});
		});
		it("can remove it's own markers", function(done) {
			mockSock1.callMockedListener("removeMarker", markerID, function(answer) {
				assert(answer.okay);
				mockSock1.callMockedListener("fetchMarkers", null, function(answer) {
					assert(answer.markers.length === 3);
					done();
				});
			});
		})
	});
};
