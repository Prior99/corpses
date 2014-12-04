var Database = require("../src/database.js");
var Client = require("../src/client.js");
var dbConfig = require("./config.json");
var assert = require("assert");

describe("The interface to the client", function() {
	it("can setup the connection to the testdatabase", function(done) {
		require("./util/resetdb.js")(done);
	});
	var requiredListeners = ["login", "register", "addMarker", "removeMarker", "fetchMarkers",
		"ignoreMarker", "addFriend", "removeFriend", "enableUser",
		"disableUser", "getTime", "getKnownPlayers", "getInfo", "getPlayers", "getUserData", "getUsers",
		"addAdmin", "removeAdmin"];
	var MockWebsocket = require("./util/mockedwebsocket.js");
	var database = new Database(dbConfig);
	var mockServer = require("./util/mockedserver.js");

	var mockSock1 = new MockWebsocket();
	var mockSock2 = new MockWebsocket();

	var client1 = new Client(mockSock1, database, mockServer);
	var client2 = new Client(mockSock2, database, mockServer);

	mockServer.clients.push(client1);
	mockServer.clients.push(client2);

	describe("The general system", function() {
		it("registers all listeners", function() {
			for(var i in requiredListeners) {
				var r = requiredListeners[i];
				assert(mockSock1.listeners.indexOf(r) !== -1);
			}
		});
	});
	require("./client/register.js")(client1, database, mockServer, mockSock1);
	require("./client/login.js")(client1, database, mockServer, mockSock1);
	require("./client/friends.js")(client1, client2, database, mockServer, mockSock1, mockSock2);
	require("./client/markers.js")(client1, client2, database, mockServer, mockSock1, mockSock2);
});
