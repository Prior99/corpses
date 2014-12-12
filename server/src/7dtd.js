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

var Winston = require('winston');
var net = require("net");
var Regexes = require("./regex.js");
var Events = require('events');
var Util = require("util");

function Connection(config) {
	Winston.info("Initializing Telnetclient... ");
	this.client = new net.Socket();
	this.client.on("error", function() {
		Winston.error("Initializing Telnetclient failed. Is the server running and reachable?");
		this.emit("error");
	}.bind(this));
	this.client.on("close", function() {
		this.emit("close");
	}.bind(this));
	this.buffer = "";
	this.client.on("data", function(data) {
		this.buffer += data.toString();
		this.checkMessage();
	}.bind(this));
	this.config = config;
}

Util.inherits(Connection, Events.EventEmitter);

Connection.prototype.connect = function() {
	this.client.connect(this.config.telnetPort, this.config.telnetHost, function() {
		Winston.info("Initializing Telnetclient okay.");
		this.emit("open");
	}.bind(this));
};

Connection.prototype.shutdown = function(callback) {
	this.client.once("close", callback);
	this.client.end();
};

Connection.prototype.checkMessage = function() {
	var index;
	var reg = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\s\d+\.\d\d\d\s/gm;
	if((index = this.buffer.search(reg)) !== -1) {
		var msgs = this.buffer.split(reg);
		this.buffer = "";
		while(msgs.length > 0) {
			var string = msgs.shift();
			if(this.parseMessage(string)) {

			}
			else {
				if(msgs.length === 0) {
					this.buffer = string;
					break;
				}
			}
		}
	}
};

Connection.prototype.triggerGetTime = function() {
	this.client.write("gettime\n");
};

Connection.prototype.triggerMem = function() {
	this.client.write("mem\n");
};

Connection.prototype.triggerListKnownPlayers = function() {
	this.client.write("listknownplayers\n");
};

Connection.prototype.triggerListPlayersExtended = function() {
	this.client.write("listplayers\n");
};

Connection.prototype.triggerKickPlayer = function(name, reason){
	this.client.write("kick " + name + (reason === undefined ? "": " " + reason) + "\n");
};

Connection.prototype.parseMessage = function(string) {
	var result;
	Events.EventEmitter.call(this);
	for(var type in Regexes) {
		var regex = Regexes[type];
		if((result = regex.exec(string)) !== null) {
			if(type === "listPlayersExtended" || type === "listKnownPlayers") {
				var array = [];
				array.push(result);
				while((result = regex.exec(string)) !== null) {
					array.push(result);
				}
				this.computeMessage(type, array);
			}
			else {
				this.computeMessage(type, result);
			}
			return true;
		}
	}
	return false;
};

Connection.prototype.computeMessage = function(type, array) {
	switch(type) {
		case "info": {
			this.emit("info", {
				worldTime : array[1],
				fps : array[2],
				memoryUsed : array[3],
				memoryMax : array[4],
				chunks : array[5],
				cgo : array[6],
				players : array[7],
				zombies : array[8],
				entitiesLoaded : array[9],
				entitiesOverall : array[10],
				items : array[11]
			});
			break;
		}
		case "spawningWanderingHorde": {
			this.emit("spawningWanderingHorde");
			break;
		}
		case "listKnownPlayers": {
			var results = [];
			for(var i in array) {
				var player = array[i];
				results.push({
					name : player[1],
					id : player[2],
					steamid : player[3],
					online : player[4] === "True",
					ip : player[5],
					playtime : player[6],
					seen : player[7]
				});
			}
			this.emit("listKnownPlayers", results);
			break;
		}
		case "getTime": {
			this.emit("getTime", {
				day : array[1],
				hour : array[2],
				minute : array[3],
			});
			break;
		}
		case "listPlayersExtended": {
			var players = [];
			for(var j in array) {
				var p = array[j];
				players.push({
					id : p[1],
					name : p[2],
					position : {
						x : p[3],
						y : p[4],
						z : p[5],
					},
					rotation : {
						x : p[6],
						y : p[7],
						z : p[8],
					},
					remote : p[9] === "True",
					health : p[10],
					deaths : p[11],
					zombieKills : p[12],
					playerKills : p[13],
					score : p[14],
					steamid : p[15],
					ip : p[16],
					ping : p[17],
				});
			}
			this.emit("listPlayersExtended", players);
			break;
		}
		case "playerConnected": {
			this.emit("playerConnected", {
				clientID : array[1],
				id : array[2],
				name : array[3],
				steamid : array[4],
				ip : array[5]
			});
			break;
		}
		case "playerDisconnected": {
			this.emit("playerDisconnected", {
				name : array[1],
				playTime : array[2]
			});
			break;
		}
		case "playerSetOnline": {
			this.emit("playerSetOnline", {
				steamid : array[1]
			});
			break;
		}
		case "playerSetOffline": {
			this.emit("playerSetOffline", {
				steamid : array[1]
			});
			break;
		}
	}
};

module.exports = Connection;
