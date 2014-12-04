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
var TelnetClient = require("./7dtd.js");
var WS = require("ws");
var Websocket = require("./websocket_server.js");
var config = require("../config.json");
var FS = require("fs");
var Database = require("./database.js");
var Client = require("./client.js");
var Cache = require("./cache.js");

Winston.add(Winston.transports.File, { filename: 'server.log' });

function Server() {
	this.wsServer = null;
	this.cache = new Cache({time : 5000, knownPlayers : 10000, playersExtended : 1000});
	this.telnetClient = new TelnetClient();
	this.telnetClient.on("open", function(){
		Winston.info("Connection to 7DTD established.");
		this.telnetClient.triggerListKnownPlayers();
		this.cache.connectionEstablished(this.telnetClient);
		this.database = new Database(config);
		this.clients = [];
		this.startWebsocketServer();
		this.initTelnetClient();
		this.symlinkMap();
	}.bind(this));
}

Server.prototype.symlinkMap = function() {
	FS.symlink(config.mapDirectory, config.clientDirectory + "/map", function(err) {
		if(err) {
			if(err.errno !== 47) {
				Winston.error("Unable to create symlink for map.\nPlease create it manually by executing the following command:\n\nln -s " + config.mapDirectory + " " + config.clientDirectory + "/map");
			}
		}
		else {
			Winston.info("Map successfully linked. (" + config.mapDirectory + " -> " + config.clientDirectory + "/map");
		}
	});
};

Server.prototype.notifyNewUser = function() {
	this.broadcast("updated", "users");
};

Server.prototype.startWebsocketServer = function() {
	Winston.info("Starting Websocketserver...");
	var me = this;
	var portfile = "/*\n * This is an generated file.\n * Do not edit this file!\n * It will be overwritten on every start of the server.\n */\n\nvar _port = " + config.websocketPort + ";\n";
	FS.writeFile(config.clientDirectory + "/port.js", portfile, function(err) {
		if(err) {
			Winston.error("Unable to create file \"" + config.clientDirectory + "/port.js\". Please create it manually with the following content:\n" + portfile + "\n");
		}
		else {
			wsServer = new WS.Server({
				host : "0.0.0.0",
				port : config.websocketPort
			}).on("connection", function(ws) {
				(function(wsc) {
					var client = new Client(wsc, me.database, me);
					me.clients.push(client);
					Winston.info("New client connected. Currently " + me.clients.length + " clients connected.");
				})(new Websocket(ws));
			})
			.on("error", function() {
				Winston.error("The websocketserver could not be started. Is the port maybe in use?");
			});
		}
	});
};

Server.prototype.removeClient = function(client) {
	var index;
	if((index = this.clients.indexOf(client)) !== -1) {
		this.clients.splice(index, 1);
		Winston.info("Client disconnected. Currently " + this.clients.length + " clients connected.");
	}
	else {
		Winston.error("Tried to remove client from clients that was not known.");
	}
};

Server.prototype.broadcast = function(name, obj) {
	for(var i in this.clients) {
		this.clients[i].sendEvent(name, obj);
	}
};

Server.prototype.broadcastToUser = function(steamid, name, obj) {
	for(var i in this.clients) {
		var client = this.clients[i];
		if(client.isUser(steamid)) {
			client.sendEvent(name, obj);
		}
	}
};

Server.prototype.initTelnetClient = function() {
	var me = this;
	this.telnetClient.on("close", function() {
		Winston.info("Connection to 7DTD closed. Restarting it!");
		try{
			me.cache.connectionLost();
		}
		catch(error){
			console.err("Error closing TelnetClient: " + error);
		}
	});
	this.telnetClient.on("playerConnected", function(evt) {
		if(config.kickUnregistered !== undefined && config.kickUnregistered === true){
			me.database.getUserBySteamID(evt.steamid, function(err, result){
				if(err === undefined && result === undefined){
					me.telnetClient.triggerKickPlayer(evt.name, "You must have an enabled account on " + (config.website === undefined ? "our website": config.website) + " to play on this server");
				}
				else{
					me.broadcast("playerConnected", evt);
				}
			});
		}
	});
	this.telnetClient.on("playerDisconnected", function(evt) {
		me.broadcast("playerDisconnected", evt);
	});
	this.telnetClient.on("playerSetOnline", function(evt) {
		me.broadcast("playerSetOnline", evt);
	});
	this.telnetClient.on("playerSetOffline", function(evt) {
		me.broadcast("playerSetOffline", evt);
	});
	this.telnetClient.on("spawningWanderingHorde", function(evt) {
		me.broadcast("spawningWanderingHorde", evt);
	});
	this.telnetClient.on("info", function(evt) {
		me.broadcast("updated", "info");
	});
	this.telnetClient.on("listKnownPlayers", function(evt) {
		me.broadcast("updated", "knownPlayers");
	});
	this.telnetClient.on("getTime", function(evt) {
		me.broadcast("updated", "time");
	});
	this.telnetClient.on("listPlayersExtended", function(evt) {
		me.broadcast("updated", "playersExtended");
	});
};

module.exports = Server;
