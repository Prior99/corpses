var sample = require("../samples/telnet_sampledata1.js");

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
	broadcastToUser : function(steamid, name, obj) {
		for(var i in this.clients) {
			var client = this.clients[i];
			if(client.isUser(steamid)) {
				client.sendEvent(name, obj);
			}
		}
	}
};

module.exports = MockServer;
