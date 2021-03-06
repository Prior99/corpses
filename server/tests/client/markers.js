var assert = require("assert");
var MockWebsocket = require("../util/mockedwebsocket.js");
var Client = require("../../src/client.js");

module.exports = function(client1, client2, database, server, mockSock1, mockSock2) {
	describe("Adding Markers", function() {
		it("can add a public marker", function(done) {
			mockSock2.callMockedListener("login", {name : "Test3", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"},
				function(answer) {
					assert(answer.okay);
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
				}
			);
		});
		it("can fetch public markers when not logged in", function(done) {
			var mockSock3 = new MockWebsocket();
			var client3 = new Client(mockSock3, database, server);
			server.clients.push(client3);
			mockSock3.callMockedListener("fetchMarkers", null, function(answer) {
				assert.equal(answer.markers.length, 1);
				assert.equal(answer.markers[0].lat, 14.3);
				assert.equal(answer.markers[0].lng, -3.4);
				done();
			});
		})
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
			mockSock1.callMockedListener("removeFriend", client2.user.steamid, function() {
				mockSock2.callMockedListener("removeFriend", client1.user.steamid, function() {
					database.areFriends(client1.user.id, client2.user.id, function(err, okay) {
						assert(!okay && !err);
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
				});
			});
		});
		it("can add a friends-only marker and friends can see it", function(done) {
			mockSock1.callMockedListener("addFriend", client2.user.steamid, function() {
				mockSock2.callMockedListener("addFriend", client1.user.steamid, function() {
					database.areFriends(client1.user.id, client2.user.id, function(err, okay) {
						assert(okay && !err);
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
				});
			});
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
		var markerIgnoreID;
		it("can fetch markers and see public and friend- markers", function(done) {
			mockSock2.callMockedListener("fetchMarkers", null, function(answer) {
				assert(answer.okay);
				assert(answer.markers.length === 3);
				markerIgnoreID = answer.markers[1].id;
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
		});
		it("can no longer see deleted markers", function(done) {
			mockSock2.callMockedListener("fetchMarkers", null, function(answer) {
				assert(answer.okay);
				assert(answer.markers.length === 2)
				done();
			});
		});
		it("can ignore markers and does not see them afterwards", function(done) {
			mockSock2.callMockedListener("ignoreMarker", markerIgnoreID, function(answer) {
				assert(answer.okay);
				mockSock2.callMockedListener("fetchMarkers", null, function(answer) {
					assert(answer.okay);
					assert(answer.markers.length === 1)
					done();
				});
			});
		});
		it("can't add markers without location or icon", function(done) {
			mockSock1.callMockedListener("addMarker", {
				name : "Testmarker 3",
				description : "This is a testmarker",
				icon : "fa-trash",
				visibility : 'friends'}, function(answer) {
					assert(!answer.okay);
					done();
				}
			);
		});
		it("can remove friends-only markers and a respective event is cast", function(done) {
			mockSock2.lastMsg = null;
			mockSock1.callMockedListener("removeMarker", 9, function(answer) {
				assert(answer.okay);
				assert.notEqual(mockSock2.lastMsg, null);
				assert.equal(mockSock2.lastMsg.key, "removeMarker");
				done();
			});
		});
		it("can not remove a non-existing marker", function(done) {
			mockSock1.callMockedListener("removeMarker", 686, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not remove a marker if not enough arguments are given", function(done) {
			mockSock1.callMockedListener("removeMarker", undefined, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not remove a private marker", function(done) {
			mockSock1.callMockedListener("removeMarker", 7, function(answer) {
				assert(answer.okay);
				done();
			});
		});
		it("can not ignore a marker without supplying it's id", function(done) {
			mockSock1.callMockedListener("ignoreMarker", undefined, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
		it("can not ignore a non-existent marker", function(done) {
			mockSock1.callMockedListener("ignoreMarker", 678, function(answer) {
				assert(!answer.okay);
				done();
			});
		});
	});
};
