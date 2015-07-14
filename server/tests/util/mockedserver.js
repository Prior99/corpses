var sample = require("../samples/cache_sampledata.js");
var Server = require("../../src/server.js");

MockServer = {
	newUser : false,
	sentMarker : false,
	notifyNewUser : function() {
		MockServer.newUser = true;
	},
	clients : [],
	cache : {
		knownPlayers : sample.knownPlayers,
		playersExtended : sample.listPlayersExtended,
		time : sample.time,
		info : sample.info
	},
	broadcastMarker : Server.prototype.broadcastMarker,
	broadcastToUser : function(steamid, name, obj) {
		for(var i in this.clients) {
			var client = this.clients[i];
			if(client.isUser(steamid)) {
				client.sendEvent(name, obj);
			}
		}
	},
	getUserClients : function(steamid, name, obj) {
		var list = [];
		for(var i in this.clients) {
			var client = this.clients[i];
			if(client.isUser(steamid)) {
				list.push(client);
			}
		}
		return list;
	},
	telnetClient : {
		triggerKickPlayer : function() {}
	}
};

module.exports = MockServer;
