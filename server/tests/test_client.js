var Database = require("../src/database.js");
var Client = require("../src/client.js");
var dbConfig = require("./config.json");
var assert = require("assert");
var ResetDB = require("./util/resetdb.js");
var mockServer = require("./util/mockedserver.js");
var MockWebsocket = require("./util/mockedwebsocket.js");

describe("The interface to the client", function() {
	var requiredListeners = ["login", "register", "addMarker", "removeMarker", "fetchMarkers",
		"ignoreMarker", "addFriend", "removeFriend", "enableUser",
		"disableUser", "getTime", "getKnownPlayers", "getInfo", "getPlayers", "getUserData", "getUsers",
		"addAdmin", "removeAdmin"];

	var database;
	var mockSock1;
	var mockSock2;
	var client1;
	var client2;

	database = new Database(dbConfig.database);
	mockServer.database = database;
	mockSock1 = new MockWebsocket();
	mockSock2 = new MockWebsocket();

	client1 = new Client(mockSock1, database, mockServer);
	client2 = new Client(mockSock2, database, mockServer);

	mockServer.clients.push(client1);
	mockServer.clients.push(client2);

	describe("In general", function() {
		it("can setup the connection to the testdatabase", function(done) {
			ResetDB.purgeDatabase(function() {
				ResetDB.createDatabase(function() {
					ResetDB.prepareDatabase(done);
				});
			});
		});
		it("registers all listeners", function() {
			for(var i in requiredListeners) {
				var r = requiredListeners[i];
				assert(mockSock1.listeners.indexOf(r) !== -1);
			}
		});
	});
	require("./client/register.js")(client1, database, mockServer, mockSock1);
	require("./client/login.js")(client1, client2, database, mockServer, mockSock1, mockSock2);
	require("./client/friends.js")(client1, client2, database, mockServer, mockSock1, mockSock2);
	require("./client/gamequeries.js")(client1, client2, database, mockServer, mockSock1, mockSock2);
	require("./client/markers.js")(client1, client2, database, mockServer, mockSock1, mockSock2);
	require("./client/admin.js")(client1, client2, database, mockServer, mockSock1, mockSock2);

	describe("Afterwards", function() {
		it("can shutdown the database", function(done) {
			database.shutdown(done);
		});
	});
});
