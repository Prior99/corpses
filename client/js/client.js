var NET = {};

NET.onUpdate = function(what) {
	switch(what) {
		case "info":
			NET.refreshInfo();
			break;
		case "knownPlayers":
			NET.refreshKnownPlayers();
			break;
		case "playersExtended":
			NET.refreshPlayers();
			break;
		case "time":
			NET.refreshTime();
			break;
	};
};

NET.refreshInfo = function() {
	Websocket.send("getInfo", undefined, function(obj) {
		UI.updateInfo(obj);
	});
};

NET.refreshKnownPlayers = function() {
	Websocket.send("getKnownPlayers", undefined, function(obj) {
		UI.updateKnownPlayers(obj);
	});
};

NET.refreshPlayers = function() {
	Websocket.send("getPlayers", undefined, function(obj) {
		UI.updatePlayers(obj.players);
	});
};

NET.refreshTime = function() {
	Websocket.send("getTime", undefined, function(obj) {
		UI.updateTime(obj);
	});
};

NET.refreshAll = function() {
	NET.refreshTime();
	NET.refreshKnownPlayers();
	NET.refreshPlayers();
	NET.refreshInfo();
}

NET.displayHordeWarning = function() {
	UI.firePopup({
		headline : "Horde spawned",
		text : "A wandering horde was spawned from the server.",
		icon : "fa-warning",
		timeout : 30
	});
};

NET.displayPlayerJoinedWarning = function(player) {
	UI.firePopup({
		headline : "Player joined",
		text : "The player " + player.name + " has connected to the game.",
		icon : "fa-user",
		timeout : 8
	});
};

NET.displayPlayerDisconnectedWarning = function(player) {
	UI.firePopup({
		headline : "Player left",
		text : "The player " + player.name + " has disconnected from the game.",
		icon : "fa-user",
		timeout : 8
	});
};

$(function() {
	Websocket.addMessageListener("spawningWanderingHorde", NET.displayHordeWarning);
	Websocket.addMessageListener("playerConnected", NET.displayPlayerJoinedWarning);
	Websocket.addMessageListener("playerDisconnected", NET.displayPlayerDisconnectedWarning);
	//Websocket.addMessageListener("markers", ); //TODO
	//Websocket.addMessageListener("removeMarker", removeMarker); //TODO
	Websocket.addMessageListener("updated", NET.onUpdate);
	Websocket.addOpenListener(function() {
		NET.refreshAll();
	});
	//Websocket.init();
});
