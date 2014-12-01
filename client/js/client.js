/*
 *  This file is part of CORPSES, a webinterface for 7 Days to Die.
 *
 *  CORPSES is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CORPSES is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with CORPSES. If not, see <http://www.gnu.org/licenses/>.
 */

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
		case "users":
			NET.refreshUsers();
			break;
		case "friends":
			UI.clearPlayers();
			NET.refreshPlayers();
			NET.refreshUsers();
			MapSystem.reloadMarkers();
	}
};

NET.addMarker = function(obj, callback) {
	Websocket.send("addMarker", obj, function(answer) {
		if(answer.okay) {
			callback(answer.okay);
		}
		else {
			Errors.displayError(answer.reason);
		}
	});
};

NET.removeMarker = function(id, callback) {
	Websocket.send("removeMarker", id, function(obj) {
		if(obj.okay) {
			callback(obj.okay);
		}
		else {
			Errors.displayError(obj.reason);
		}
	});
};

NET.ignoreMarker = function(id, callback) {
	Websocket.send("ignoreMarker", id, function(obj) {
		if(obj.okay) {
			callback(obj.okay);
		}
		else {
			Errors.displayError(obj.reason);
		}

	});
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
		if(obj.okay) {
			UI.updatePlayers(obj.players);
			MapSystem.updatePlayers(obj.players);
		}
		else {
			Errors.displayError(obj.reason);
		}
	});
};

NET.refreshTime = function() {
	Websocket.send("getTime", undefined, function(obj) {
		UI.updateTime(obj);
	});
};

NET.refreshUsers = function() {
	Websocket.send("getUsers", undefined, function(obj) {
		if(obj.okay) {
			UI.updateUsers(obj.users);
		}
		else {
			Errors.displayError(obj.reason);
		}
	});
};

NET.toggleEnabled = function(player) {
	if(player.enabled) {
		Websocket.send("disableUser", player.steamid, function(obj) {
			if(obj.okay) {
				NET.refreshUsers();
			}
			else {
				Errors.displayError(obj.reason);
			}
		});
	}
	else {
		Websocket.send("enableUser", player.steamid, function(obj) {
			if(obj.okay) {
				NET.refreshUsers();
			}
			else {
				Errors.displayError(obj.reason);
			}
		});
	}
};

NET.toggleAdmin = function(player) {
	if(player.admin) {
		Websocket.send("removeAdmin", player.steamid, function(obj) {
			if(obj.okay) {
				NET.refreshUsers();
			}
			else {
				Errors.displayError(obj.reason);
			}
		});
	}
	else {
		Websocket.send("addAdmin", player.steamid, function(obj) {
			if(obj.okay) {
				NET.refreshUsers();
			}
			else {
				Errors.displayError(obj.reason);
			}
		});
	}
};

NET.toggleFriend = function(player) {
	if(player.friend) {
		Websocket.send("removeFriend", player.steamid, function(obj) {
			if(obj.okay) {
				NET.refreshUsers();
			}
			else {
				Errors.displayError(obj.reason);
			}
		});
	}
	else {
		Websocket.send("addFriend", player.steamid, function(obj) {
			if(obj.okay) {
				NET.refreshUsers();
			}
			else {
				Errors.displayError(obj.reason);
			}
		});
	}
};

NET.refreshAll = function() {
	NET.refreshTime();
	NET.refreshKnownPlayers();
	NET.refreshPlayers();
	NET.refreshInfo();
	NET.refreshUsers();
};

NET.displayHordeWarning = function() {
	UI.firePopup({
		headline : "Horde spawned",
		text : "A wandering horde was spawned by the server.",
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

NET.playerOffline = function(evt) {
	UI.removePlayerMapping(evt.steamid);
	MapSystem.removePlayerMapping(evt.steamid);
};

NET.init = function() {
	Websocket.addMessageListener("spawningWanderingHorde", NET.displayHordeWarning);
	Websocket.addMessageListener("playerConnected", NET.displayPlayerJoinedWarning);
	Websocket.addMessageListener("playerDisconnected", NET.displayPlayerDisconnectedWarning);
	Websocket.addMessageListener("playerSetOffline", NET.playerOffline);
	//Websocket.addMessageListener("markers", ); //TODO
	//Websocket.addMessageListener("removeMarker", removeMarker); //TODO
	Websocket.addMessageListener("updated", NET.onUpdate);
	Websocket.addMessageListener("reload", function() {
		window.location.href = window.location.href;
	});
	NET.refreshAll();
};
