var Database = require("../src/database.js");
var Client = require("../src/client.js");
var dbConfig = require("./config.json");
var MySQL = require('mysql');
var FS = require("fs");

describe("The interface to the client", function(done) {
	var sql = FS.readFileSync("server/tests/samples/database.sql", {encoding : "utf8"});
	var connection = MySQL.createConnection(dbConfig.database);
	connection.connect(function(err) { if(err) throw err; });
	connection.query(sql, function(err, rows, fields) { if(err) throw err; });
	connection.end(function(err) {
		if(err) throw err;
	});
	var requiredListeners = ["login", "register", "addMarker", "removeMarker", "fetchMarkers",
		"getFriendsOf", "getFriendsBy", "ignoreMarker", "addFriend", "removeFriend", "enableUser",
		"disableUser", "getTime", "getKnownPlayers", "getInfo", "getPlayers", "getUserData", "getUsers",
		"addAdmin", "removeAdmin"];
	var listeners = [];
	var listenerMap = {};
	function callMockedListener(name, data, callback) {
		var l = listenerMap[name];
		if(l.async) {
			l.callback(data, callback);
		}
		else {
			callback(l.callback(data));
		}
	}
	var mockWebsocket = {
		addListener : function(key, callback, async) {
			listeners.push(key);
			listenerMap[key] = {
				callback : callback,
				async : async
			};
		},
		send : function(key, data, callback) {

		},
		addOpenListener : function(callback) {

		},
		addCloseListener : function(callback) {

		}
	};

	var database = new Database(dbConfig);
	var mockServer = {
		newUser : false,
		notifyNewUser : function() {
			mockServer.newUser = true;
		}
	};
	var client = new Client(mockWebsocket, database, mockServer);
	describe("The general system", function() {
		it("registers all listeners", function() {
			for(var i in requiredListeners) {
				var r = requiredListeners[i];
				listeners.indexOf(r).should.not.equal(-1);
			}
		});
	})
	describe("Login", function() {
		it("can login to an existing account", function(done) {
			callMockedListener("login", {name : "Test1", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.true;
				done();
			});
		});
		it("can not login to an non-existing account", function(done) {
			callMockedListener("login", {name : "Foo", password : "123"}, function(answer) {
				answer.okay.should.be.false;
				done();
			});
		});
		it("can not login with wrong password", function(done) {
			callMockedListener("login", {name : "Test1", password : "5920422f9d417e48f1fa07e998e86f7a6667efdc4fb8a04a1f3ff5a4f7a27ae3"}, function(answer) {
				answer.okay.should.be.false;
				done();
			});
		});
		it("can not login to an disabled account", function(done) {
			callMockedListener("login", {name : "Test2", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.false;
				done();
			});
		});
	});
	describe("Register", function() {
		it("can register a non-existing account", function(done) {
			callMockedListener("register", {name : "Test5", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.true;
				mockServer.newUser.should.be.true;
				database.getUserByName("Test5", function(err, user) {
					user.name.should.equal("Test5");
					user.steamid.should.equal("56789");
					user.password.should.equal("a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3");
					user.enabled.should.eql(0);
					done();
				});
			});
		});
		it("can't register an existing account", function(done) {
			callMockedListener("register", {name : "Test5", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.false;
				done();
			});
		});
		it("can't register an account with a name shorter than 3 characters", function(done) {
			callMockedListener("register", {name : "Ah", steamid : "56789", password : "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"}, function(answer) {
				answer.okay.should.be.false;
				done();
			});
		});
	});
});
