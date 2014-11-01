var TelnetClient = require("./7dtd.js");

var telnetClient = new TelnetClient();
telnetClient.on("info", function(evt) {
	console.log("ON INFO:");
	console.log(evt);
});
telnetClient.on("spawningWanderingHorde", function(evt) {
	console.log("ON SPAWNINGWANDERINGHORDE:");
	console.log(evt);
});
telnetClient.on("listKnownPlayers", function(evt) {
	console.log("ON LISTKNOWNPALYERS:");
	console.log(evt);
});
telnetClient.on("getTime", function(evt) {
	console.log("ON GETTIME:");
	console.log(evt);
});
telnetClient.on("listPlayersExtended", function(evt) {
	console.log("ON LISTPLAYERSEXTENDED:");
	console.log(evt);
});
telnetClient.on("playerConnected", function(evt) {
	console.log("ON PLAYERCONNECTED:");
	console.log(evt);
	telnetClient.triggerPlayersExtended();
});
telnetClient.on("playerDisconnected", function(evt) {
	console.log("ON PLAYERDISCONNECTED:");
	console.log(evt);
});
telnetClient.on("close", function() {
	console.log("Connection to 7DTD closed.");
});
telnetClient.on("open", function() {
	console.log("Conenction to 7DTD established.");
	telnetClient.triggerListKnownPlayers();
});
