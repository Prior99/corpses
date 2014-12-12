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
var Events = require('events');
var Util = require("util");
var WS = require("ws");
var FS = require("fs");
var Client = require("./client.js");
var Websocket = require("./websocket_server.js");
var HTTP = require('http');

/**
 * This class represents the server itself. It utilizes the database, the cache,
 * the telnetclient and starts a websocketserver to listen for incoming connections.
 * @constructor @class
 * @param {object} cache - an instance of the cache that stores the information of the telnetclient
 * @param {object} telnetClient - an instance of the telnetclient connected to the 7DTD server
 * @param {object} database - an instance of the wrapper for the databaseconnection
 * @param {object} config - the parsed json of the configfile
 */
function Server(cache, telnetClient, database, config) {
	Winston.info("The server is starting...");
	this.config = config;
	this.cache = cache;
	this.telnetClient = telnetClient;
	this.database = database;
	this.wsServer = null;
	this.telnetClient.on("open", function(){
		Winston.info("Connection to 7DTD established.");
		this.telnetClient.triggerListKnownPlayers();
		this.telnetClient.triggerMem();
		this.telnetClient.triggerGetTime();
		this.cache.connectionEstablished(this.telnetClient);
		this.clients = [];
		this.initTelnetClient();
		this._symlinkMap();
		this._startWebsocketServer();
	}.bind(this));
}

Util.inherits(Server, Events.EventEmitter);

Server.prototype._websocketStarted = function() {
	Winston.info("Server up and running!");
	this.emit("started");
};

Server.prototype._symlinkMap = function() {
	FS.symlink(this.config.mapDirectory, this.config.clientDirectory + "/map", function(err) {
		if(err) {
			if(err.errno !== 47) {
				Winston.error("Unable to create symlink for map.\n" +
					"Please create it manually by executing the following command:\n\n" +
					"ln -s " + this.config.mapDirectory + " " + this.config.clientDirectory + "/map");
				this.emit("error", err);
			}
		}
		else {
			Winston.info("Map successfully linked. (" + this.config.mapDirectory +
				" -> " + this.config.clientDirectory + "/map");
		}
	}.bind(this));
};

/**
 * Tells this server that a new user connected. A respective "updated" will be broadcasted
 * To each conencted client.
 */
Server.prototype.notifyNewUser = function() {
	this.broadcast("updated", "users");
};

Server.prototype._startWebsocketServer = function() {
	var me = this;
	var portfile = "/*\n * This is an generated file.\n" +
		" * Do not edit this file!\n" +
		" * It will be overwritten on every start of the server.\n" +
		" */\n\n" +
		"var _port = " + this.config.websocketPort + ";\n";
	FS.writeFile(this.config.clientDirectory + "/port.js", portfile, function(err) {
		if(err) {
			Winston.error("Unable to create file \"" +
				this.config.clientDirectory + "/port.js\"." +
				"Please create it manually with the following content:\n" + portfile + "\n");
			this.emit("error", err);
		}
		else {
			this.httpServer = HTTP.createServer();
			this.httpServer.on("error", function(err) {
				Winston.error("The websocketserver could not be started. Is the port maybe in use?");
				this.emit("error", err);
			}.bind(this));
			this.httpServer.listen(this.config.websocketPort, function() {
				this.wsServer = new WS.Server({
					server : this.httpServer
				});
				this.wsServer.on("connection", function(ws) {
					(function(wsc) {
						var client = new Client(wsc, me.database, me);
						me.clients.push(client);
					})(new Websocket(ws));
				});
				Winston.info("Websocketserver started.");
				this._websocketStarted();
			}.bind(this));
		}
	}.bind(this));
};

/**
 * Will remove a client from the list of connected clients.
 * @param {object}  - The client to be removed. If the client is not in the list
 * 				      of known clients, an error will be logged.
 */
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

/**
 * Broadcast a message to all clients know to this server. There will be no
 * callback. This is a write-only operation on the websocket.
 * @param {string} name - name of the event to broadcast to all clients
 * @param {*} obj - data to broadcast in this event. This may be anything you like.
 */
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
		me.cache.connectionLost();
	});
	this.telnetClient.on("playerConnected", function(evt) {
		if(this.config.kickUnregistered !== undefined && this.config.kickUnregistered === true){
			me.database.getUserBySteamID(evt.steamid, function(err, result){
				if(err === undefined && result === undefined){
					me.telnetClient.triggerKickPlayer(evt.name,
						"You must have an enabled account on " +
						(this.config.website === undefined ? "our website": this.config.website) +
						" to play on this server"
					);
				}
				else{
					me.broadcast("playerConnected", evt);
				}
			}.bind(this));
		}
		else {
			me.broadcast("playerConnected", evt);
		}
	}.bind(this));
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

Server.prototype.shutdown = function() {
	var i = 3;
	var self = this;
	function closed() {
		i--;
		if(i === 0) {
			Winston.info("Server is now down!");
			self.emit("stopped");
		}
	}
	Winston.info("Server is about to shutdown...");
	this.telnetClient.shutdown(function() {
		Winston.info("Connection to 7DTD closed.");
		closed();
	});
	this.wsServer.close();
	this.httpServer.close(function() {
		Winston.info("Websocketserver closed.");
		closed();
	});
	this.database.shutdown(function() {
		Winston.info("Disconnected from database.");
		closed();
	});
};

module.exports = Server;
