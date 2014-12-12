var Database = require("../src/database.js");
var dbConfig = require("./config.json");
var assert = require("assert");
var FS = require("fs");
var MySQL = require('mysql');
var ResetDB = require("./util/resetdb.js");

describe("The database when failing", function() {
	var database = new Database(dbConfig);
	it("can prepare the database to fail", function(done) {
		ResetDB.purgeDatabase(done);
	});
	it("reacts fine to adding a marker", function(done) {
		database.addMarker({
			name : "Testmarker 1",
			lat : 14.3,
			lng : -3.4,
			description : "This is a testmarker",
			icon : "fa-trash",
			visibility : 'public'}, 3, function(err, result) {
				assert.notEqual(err, undefined);
				assert.equal(err.code, 'ER_NO_SUCH_TABLE');
				done();
			}
		);
	});
	it("reacts fine to getting a marker", function(done) {
		database.getMarker(3, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to removing a marker", function(done) {
		database.removeMarker(3, 3, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to validating a user", function(done) {
		database.validateUser("Test1", "asdfghjkl", function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to checking whether two players are friends", function(done) {
		database.areFriends(3, 4, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to fetching markers as user", function(done) {
		database.fetchMarkers(3, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to fetching markers as guest", function(done) {
		database.fetchMarkers(undefined, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to adding friends", function(done) {
		database.addFriend(1, 2, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to removing friends", function(done) {
		database.removeFriend(1, 2, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to adding an admin", function(done) {
		database.addAdmin(1, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to removing an admin", function(done) {
		database.removeAdmin(1, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to enabling users", function(done) {
		database.enableUser(1, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to disabling users", function(done) {
		database.disableUser(1, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to validating admins", function(done) {
		database.validateAdmin(1, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to getting users by name", function(done) {
		database.getUserByName("Test1", function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to getting users by steamid", function(done) {
		database.getUserBySteamID(12345, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to getting users", function(done) {
		database.getUsers(1, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
	it("reacts fine to ignoring markers", function(done) {
		database.ignoreMarker(1, 2, function(err, result) {
			assert.notEqual(err, undefined);
			assert.equal(err.code, 'ER_NO_SUCH_TABLE');
			done();
		});
	});
});
