var TelnetClient = require("./7dtd.js");
var WS = require("ws");
var WebSocket = require("./websocket_server.js");
var config = require("../config.json");
var FS = require("fs");
var Database = require("./database.js");
var Client = require("./client.js");

function Server() {
	this.wsServer = null;
	this.telnetClient = null;
	this.database = new Database();;
	this.clients = [];
	this.startWebsocketServer();
	this.startTelnetClient();
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
					var client = new Client(wsc, this.database, this);
					clients.push(client);
					console.log("New client connected. Currently " + clients.length + " clients connected.");
				})(new WebSocket(ws));
			});
			console.log("Websocketserver Started up!");
		}
	});
}

Server.prototype.removeClient = function(client) {
	clients.splice(clients.indexOf(client), 1);
	console.log("Client disconnected. Currently " + clients.length + " clients connected.");
}

Server.prototype.broadcast = function(name, obj) {
	for(var i in this.clients) {
		this.clients.sendEvent(name, obj);
	}
};

Server.prototype.startTelnetClient = function() {
	console.log("Starting Telnetclient...");
	this.telnetClient = new TelnetClient();
	var me = this;
	this.telnetClient.on("info", function(evt) {
		me.broadcast("info", evt);
	});
	this.telnetClient.on("spawningWanderingHorde", function(evt) {
		me.broadcast("spawningWanderingHorde", evt);
	});
	this.telnetClient.on("listKnownPlayers", function(evt) {
		me.broadcast("listKnownPlayers", evt);
	});
	this.telnetClient.on("getTime", function(evt) {
		me.broadcast("getTime", evt);
	});
	this.telnetClient.on("listPlayersExtended", function(evt) {
		me.broadcast("listPlayersExtended", evt);
	});
	this.telnetClient.on("playerConnected", function(evt) {
		me.broadcast("playerConnected", evt);
	});
	this.telnetClient.on("playerDisconnected", function(evt) {
		me.broadcast("playerDisconnected", evt);
	});
	this.telnetClient.on("close", function() {
		console.log("Connection to 7DTD closed. Restarting it!");
		me.startTelnetClient();
	});
	this.telnetClient.on("open", function() {
		console.log("Connection to 7DTD established.");
		me.telnetClient.triggerListKnownPlayers();
	});
	setInterval(function() {
		me.telnetClient.triggerGetTime();
	}, 7000);
	setInterval(function() {
		me.telnetClient.triggerListKnownPlayers();
	}, 10000);
	setInterval(function() {
		me.telnetClient.triggerListPlayersExtended();
	}, 5000);
}

module.exports = Server;
