var TelnetClient = require("./7dtd.js");
var WS = require("ws");
var WebSocket = require("./websocket_server.js");
var config = require("../config.json");
var FS = require("fs");
var Database = require("./database.js");
var Client = require("./client.js");
var Cache = require("./cache.js");

function Server() {
	this.wsServer = null;
	this.cache = new Cache();
	this.telnetClient = new TelnetClient();
	this.database = new Database();
	this.clients = [];
	this.startWebsocketServer();
	this.initTelnetClient();
	this.symlinkMap();
}

Server.prototype.broadcastRemoveMarker = function(id) {
	for(var i in this.clients) {
		this.clients[i].sendRemoveMarker(id);
	}
};

Server.prototype.broadcastMarkers = function(markers) {
	for(var i in this.clients) {
		clients[i].sendMarker(markers);
	}
};

Server.prototype.symlinkMap = function() {
	FS.symlink(config.mapDirectory, config.clientDirectory + "/map", function(err) {
		if(err) {
			console.error("Unable to create symlink for map.\nPlease create it manually by executing the following command:\n\nln -s " + config.mapDirectory + " " + config.clientDirectory + "/map");
		}
		else {
			console.log("Map successfully linked. (" + config.mapDirectory + " -> " + config.clientDirectory + "/map");
		}
	});
}

Server.prototype.startWebsocketServer = function() {
	console.log("Starting Websocketserver...");
	var me = this;
	var portfile = "/*\n * This is an generated file.\n * Do not edit this file!\n * It will be overwritten on every start of the server.\n */\n\nvar _port = " + config.websocketPort + ";\n";
	FS.writeFile(config.clientDirectory + "/port.js", portfile, function(err) {
		if(err) {
			console.error("Unable to create file \"" + config.clientDirectory + "/port.js\". Please create it manually with the following content:\n" + portfile + "\n");
		}
		else {
			wsServer = new WS.Server({
				host : "0.0.0.0",
				port : config.websocketPort
			}).on("connection", function(ws) {
				(function(wsc) {
					var client = new Client(wsc, me.database, me);
					me.clients.push(client);
					console.log("New client connected. Currently " + me.clients.length + " clients connected.");
				})(new WebSocket(ws));
			});
			console.log("Websocketserver Started up!");
		}
	});
}

Server.prototype.removeClient = function(client) {
	var index;
	if((index = this.clients.indexOf(client)) != -1) {
		this.clients.splice(index, 1);
		console.log("Client disconnected. Currently " + this.clients.length + " clients connected.");
	}
	else {
		console.error("Tried to remove client from clients that was not known.");
	}
}

Server.prototype.broadcast = function(name, obj) {
	for(var i in this.clients) {
		this.clients[i].sendEvent(name, obj);
	}
};

Server.prototype.initTelnetClient = function() {
	console.log("Initializing Telnetclient...");
	var me = this;
	this.telnetClient.on("close", function() {
		console.log("Connection to 7DTD closed. Restarting it!");
		try{
			me.cache.connectionLost();
		}
		catch(error){
			console.err("Error closing TelnetClient: " + error);
		}
	});
	this.telnetClient.on("open", function() {
		console.log("Connection to 7DTD established.");
		try{
			me.telnetClient.triggerListKnownPlayers();
			me.cache.connectionEstablished(me.telnetClient);
		}
		catch(error){
			console.err("Error opening TelnetClient: " + error);
		}
	});
	this.telnetClient.on("playerConnected", function(evt) {
		me.broadcast("playerConnected", evt);
	});
	this.telnetClient.on("playerDisconnected", function(evt) {
		me.broadcast("playerDisconnected", evt);
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
}

module.exports = Server;
