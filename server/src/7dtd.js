var net = require("net");
var config = require("../config.json");
var Regexes = require("./regex.js");
var Events = require('events');

function Connection() {
	this.client = new net.Socket();
	this.client.on("data", function(data) {
		this.parseMessage(data);
	}.bind(this));
	this.client.on("close", function() {
		console.log("Telnetclient closed.");
	}.bind(this));
	this.client.connect(config.telnetPort, config.telnetHost, function() {
		console.log("Telnetclient connected.");
	}.bind(this));
};

Connection.prototype.__proto__ = Events.EventEmitter.prototype;

Connection.prototype.parseMessage = function(data) {
	var result;
	Events.EventEmitter.call(this);
	var string = data.toString();
	console.log("RECEIVED MSG: \"" + string + "\"");
	for(var type in Regexes) {
		var regex = Regexes[type];
		if(result == regex.exec(string)) {
			if(type == "listPlayersExtended" || type == "listKnownPlayers") {
				var array = [];
				array.push(result);
				while(result = regex.exec(string)) {
					array.push(result);
				}
				this.computeMessage(type, array);
			}
			else {
				this.computeMessage(type, result);
			}
			break;
		}
	}
};

Connection.prototype.computeMessage = function(type, array) {
	switch(type) {
		case "info": {
			this.emit("info", {
				upTime : array[1],
				worldTime : array[2],
				fps : array[3],
				memoryUsed : array[4],
				memoryMax : array[5],
				chunks : array[6],
				cgo : array[7],
				players : array[8],
				zombies : array[9],
				entitiesLoaded : array[10],
				entitiesOverall : array[11],
				items : array[12]
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
					online : player[4] == "True",
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
			var results = [];
			for(var i in array) {
				var player = array[i];
				results.push({
					id : player[1],
					name : player[2],
					position : {
						x : player[3],
						y : player[4],
						z : player[5],
					},
					rotation : {
						x : player[6],
						y : player[7],
						z : player[8],
					},
					remote : player[9] == "True",
					health : player[10],
					deaths : player[11],
					zombieKills : player[12],
					playerKills : player[13],
					score : player[14],
					steamid : player[15],
					ip : player[16],
					ping : player[17],
				});
			}
			this.emit("listPlayersExtended", results);
			break;
		}
		case "playerConnected": {
			this.emit("playerConnected", {
				upTime : array[1],
				clientID : array[2],
				id : array[3],
				name : array[4],
				steamid : array[5],
				ip : array[6]
			});
			break;
		}
		case "playerDisconnected": {
			this.emit("playerDisconnected", {
				upTime : array[1],
				name : array[2],
				playTime : array[3]
			});
			break;
		}
	}
}

module.exports = Connection;
