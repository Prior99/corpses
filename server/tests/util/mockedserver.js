MockServer = {
	newUser : false,
	sentMarker : false,
	notifyNewUser : function() {
		MockServer.newUser = true;
	},
	clients : [],
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
