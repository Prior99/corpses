var TelnetClient = require("./7dtd.js");
var WS = require("ws");
var Websocket = require("./websocket_server.js");
var config = require("../config.json");
var FS = require("fs");
var Database = require("./database.js");
var Client = require("./client.js");
var Cache = require("./cache.js");
var ConfigUtils = require("./configutils.js");

function Server() {
	this.wsServer = null;
	this.cache = new Cache();
	this.telnetClient = new TelnetClient();
	this.telnetClient.on("open", function(){
		console.log("Connection to 7DTD established.");
		this.telnetClient.triggerListKnownPlayers();
		this.cache.connectionEstablished(this.telnetClient);
		this.database = new Database();
		this.clients = [];
		this.startWebsocketServer();
		this.initTelnetClient();
		this.symlinkMap();
	}.bind(this));
}

Server.prototype.broadcastRemoveMarker = function(id) {
	for(var i in this.clients) {
		this.clients[i].sendRemoveMarker(id);
	}
};

Server.prototype.broadcastMarker = function(marker) {
	for(var i in this.clients) {
		this.clients[i].sendMarker(marker);
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
};

Server.prototype.notifyNewUser = function() {
	this.broadcast("updated", "users");
};

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
				})(new Websocket(ws));
			})
			.on("error", function() {
				console.error("The websocketserver could not be started. Is the port maybe in use?");
			});
		}
	});
};

Server.prototype.removeClient = function(client) {
	var index;
	if((index = this.clients.indexOf(client)) !== -1) {
		this.clients.splice(index, 1);
		console.log("Client disconnected. Currently " + this.clients.length + " clients connected.");
	}
	else {
		console.error("Tried to remove client from clients that was not known.");
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
