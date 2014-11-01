var net = require("net");
var config = require("../config.json");
var Regexes = require("./regex.js");
var Events = require('events');

function Connection() {
	this.client = new net.Socket();
	this.client.on("close", function() {
		this.emit("close");
	}.bind(this));
	this.buffer = "";
	this.client.on("data", function(data) {
		this.buffer += data.toString();
		this.checkMessage();
	}.bind(this));
	this.client.connect(config.telnetPort, config.telnetHost, function() {
		this.emit("open");
	}.bind(this));
};

Connection.prototype.__proto__ = Events.EventEmitter.prototype;

Connection.prototype.checkMessage = function() {
	var index;
	var reg = /^\d+\.\d\d\d\s/gm;
	if((index = this.buffer.search(reg)) != -1) {
		var msgs = this.buffer.split(reg);
		for(var i = 0; i < msgs.length -1; i++) {
			//console.log("CHUNK: +++" + msgs[i] + "+++");
			this.parseMessage(msgs[i]);
		}
		this.buffer = msgs[msgs.length - 1];
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
	this.client.write("listplayersextended\n");
};

Connection.prototype.parseMessage = function(string) {
	var result;
	Events.EventEmitter.call(this);
	//console.log("RECEIVED MSG: \"" + string + "\"");
	for(var type in Regexes) {
		var regex = Regexes[type];
		if(result = regex.exec(string)) {
			//console.log("DETECTED:" + type + ":" + result);
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
	}
}

module.exports = Connection;
