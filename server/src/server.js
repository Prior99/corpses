var TelnetClient = require("./7dtd.js");

var telnetClient = new TelnetClient();
telnetClient.on("info", function(evt) {
	console.log("ON INFO:" +  evt);
});
telnetClient.on("spawningWanderingHorde", function(evt) {
	console.log("ON SPAWNINGWANDERINGHORDE:" +  evt);
});
telnetClient.on("listKnownPlayers", function(evt) {
	console.log("ON LISTKNOWNPALYERS:" +  evt);
});
telnetClient.on("getTime", function(evt) {
	console.log("ON GETTIME:" +  evt);
});
telnetClient.on("listPlayersExtended", function(evt) {
	console.log("ON LISTPLAYERSEXTENDED:" +  evt);
});
telnetClient.on("playerConnected", function(evt) {
	console.log("ON PLAYERCONNECTED:" +  evt);
});
telnetClient.on("playerDisconnected", function(evt) {
	console.log("ON PLAYERDISCONNECTED:" +  evt);
});
