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
/**
 * This module will connect to the 7 Days to Die server and run a number of triggers
 * on it as well as fetching inromation provided by the server.
 * It utilizes the regular expressions defined in regex.js in order to compute the
 * messages provided by the server and retrieve the relevant data.
 *
 * @module TelnetClient
 */

/**
 * Event that will be fired when something goes wrong.
 * @event module:TelnetClient#error
 */
/**
 * Event that will be fired when the connection to the 7 Days to Die server is opened.
 * @event module:TelnetClient#open
 */
/**
 * Event that will be fired when the connection to the 7 Days to Die server is closed.
 * @event module:TelnetClient#close
 */

/**
 * Initialize the telnet client with a given configuration about host and port.
 * You will most likely pass parsed json configurationfile here.
 * Just constructing this module will not connect it. You will have to invoke
 * [connect()]{@link module:TelnetClient~TelnetClient#connect} in order to connect.
 * @constructor
 * @param {objec} config - The configuration this telnetclient will use to connect.
 * @param {number} config.telnetPort - The port the 7 Days to Die server is running on.
 * @param {string} config.telnetHost - The host of the 7DTD server.
 * @fires module:TelnetClient#close
 * @fires module:TelnetClient#error
 */
function TelnetClient(config) {
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
		this._checkMessage();
	}.bind(this));
	this.config = config;
}

Util.inherits(TelnetClient, Events.EventEmitter);

/**
 * This will make the telnet client connect to the specified server.
 * @fires module:TelnetClient#open
 */
TelnetClient.prototype.connect = function() {
	this.client.connect(this.config.telnetPort, this.config.telnetHost, function() {
		Winston.info("Initializing Telnetclient okay.");
		this.emit("open");
	}.bind(this));
};

/**
 * This will shutdown the connection to the 7 Days to Die server. After a
 * successfull shutdown, the callback will be called.
 * @param {requestCallback} callback - Will be called once the client is closed.
 */
TelnetClient.prototype.shutdown = function(callback) {
	this.client.once("close", callback);
	this.client.end();
};

TelnetClient.prototype._checkMessage = function() {
	var index;
	var reg = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\s\d+\.\d\d\d\s/gm;
	if((index = this.buffer.search(reg)) !== -1) {
		var msgs = this.buffer.split(reg);
		this.buffer = "";
		while(msgs.length > 0) {
			var string = msgs.shift();
			if(this._parseMessage(string)) {

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

/**
 * This method will trigger the 7DTD server to refresh the information about the
 * server time.
 */
TelnetClient.prototype.triggerGetTime = function() {
	this.client.write("gettime\n");
};

/**
 * This method will trigger the 7DTD server to refresh the information about the
 * general information as players, zombies and system stats.
 * This will also trigger the server to do a garbage collection so use it with
 * caution and not too frequently.
 * Please also note, that this information also refreshes ever 30 seconds
 * automatically.
 */
TelnetClient.prototype.triggerMem = function() {
	this.client.write("mem\n");
};

/**
 * Will refresh the information about known players to the server.
 */
TelnetClient.prototype.triggerListKnownPlayers = function() {
	this.client.write("listknownplayers\n");
};

/**
 * Will refresh the information about connected players and their extended
 * information.
 */
TelnetClient.prototype.triggerListPlayersExtended = function() {
	this.client.write("listplayers\n");
};


/**
 * Will kick a player by his name with an optional reason.
 * @param {string} name - The name of the player that should be kicked.
 * @param {string} [reason] - The reason to display the player. Please note that
 *							  the current version of the 7DTD server does not
 *							  support this.
 */
TelnetClient.prototype.triggerKickPlayer = function(name, reason){
	this.client.write("kick " + name + (reason === undefined ? "": " " + reason) + "\n");
};

TelnetClient.prototype._parseMessage = function(string) {
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
				this._computeMessage(type, array);
			}
			else {
				this._computeMessage(type, result);
			}
			return true;
		}
	}
	return false;
};

TelnetClient.prototype._computeMessage = function(type, array) {
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

module.exports = TelnetClient;
