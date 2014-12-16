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

/**
 * This class represents a single client connected to the server. It wraps around
 * the websocketwrapper and provides a number of handlers and sends certain
 * events back. All of the client-server communication happens here.
 * @constructor
 * @param {Websocket} websocket - The websocket this client will use.
 * @param {Database} database - Instance of the servers databaseconnection.
 * @param {Server} server - The server itself, needed to broadcast certain events.
 */
function Client(websocket, database, server) {
	this.websocket = websocket;
	this.database = database;
	this.server = server;
	this.user = undefined;
	/*
	 * Listener for Callback login
	 */
	websocket.addListener("login", function(obj, async) {
		database.validateUser(obj.name, obj.password, function(err, okay) {
			if(!checkError(err, async)) {
				if(okay) {
					this.loadUser(obj.name, function() {
						async({
							okay : true
						});
					});
				}
				else {
					async({
						okay : false,
						reason : "username_or_password_wrong"
					});
				}
			}
		}.bind(this));
	}.bind(this), true);

	/*
	 * Listener for Callback register
	 */
	websocket.addListener("register", function(obj, async) {
		if(obj.name && obj.steamid && obj.password && obj.name.length > 3) {
			database.addUser(obj, function(err) {
				if(err) {
					async({
						okay : false,
						reason : "username_taken_or_internal_error"
					});
				}
				else {
					this.loadUser(obj.name, function() {
						server.notifyNewUser();
						async({
							okay : true
						});
					});
				}
			}.bind(this));
		}
		else {
			async({
				okay : false,
				reason : "invalid_arguments"
			});
		}
	}.bind(this), true);

	/*
	 * Listener for Callback addMarker
	 */
	websocket.addListener("addMarker", function(obj, async) {
		if(this.checkLoggedIn(async)) {
			if(!obj.icon || !obj.lat || !obj.lng) {
				async({
					okay : false,
					reason : "invalid_arguments"
				});
			}
			else {
				database.addMarker(obj, this.user.id, function(err, result) {
					function done() {
						async({
							okay : true
						});
					}
					if(!checkError(err, async)) {
						if(result.visibility === 'friends') {
							this.broadcastMarker(result, true, done);
						}
						else if(result.visibility === 'public') {
							this.broadcastMarker(result, false, done);
						}
						else {
							this.sendMarker(result);
							done();
						}
					}
				}.bind(this));
			}
		}
	}.bind(this), true);

	/*
	 * Listener for Callback removeMarker
	 */
	websocket.addListener("removeMarker", function(id, async) {
		if(this.checkLoggedIn(async)) {
			if(!id) {
				async({
					okay : false,
					reason : "invalid_arguments"
				});
			}
			else {
				database.getMarker(id, function(err, result) {
					database.removeMarker(id, this.user.id, function(err) {
						function done() {
							async({
								okay : true
							});
						}
						if(result) {
							if(!checkError(err, async)) {
								if(result.visibility === 'friends') {
									this.broadcastRemoveMarker(id, true, done);
								}
								else if(result.visibility === 'public') {
									this.broadcastRemoveMarker(id, false, done);
								}
								else {
									done();
								}
							}
						}
						else {
							async({
								okay : false,
								reason : "unknown_marker"
							});
						}
					}.bind(this));
				}.bind(this));
			}
		}
	}.bind(this), true);
	/*
	 * Listener for Callback fetchMarkers
	 */
	websocket.addListener("fetchMarkers", function(obj, async) {
		database.fetchMarkers(this.isLoggedIn() ? this.user.id : undefined, function(err, markers) {
			if(!checkError(err, async)) {
				async({
					okay : true,
					markers : markers
				});
			}
		});
	}.bind(this), true);

	/*
	 * Listener for Callback ignoreMarker
	 */
	websocket.addListener("ignoreMarker", function(id, async) {
		if(this.checkLoggedIn(async)) {
			if(!id) {
				async({
					okay : false,
					reason : "invalid_arguments"
				});
			}
			else {
				database.ignoreMarker(this.user.id, id, function(err, friends) {
					if(!checkError(err, async)) {
						async({
							okay : true,
						});
					}
				});
			}
		}
	}.bind(this), true);

	/*
	 * Listener for Callback addFriend
	 */
	websocket.addListener("addFriend", function(steamid, async) {
		if(this.checkLoggedIn(async)) {
			database.getUserBySteamID(steamid, function(err, friend) {
				if(!checkError(err, async)) {
					if(friend !== undefined) {
						database.addFriend(this.user.id, friend.id, function(err) {
							if(!checkError(err, async)) {
								server.broadcastToUser(steamid, "updated", "friends");
								async({
									okay : true
								});
							}
						});
					}
					else {
						async({
							okay : false,
							reason : "user_unknown"
						});
					}
				}
			}.bind(this));
		}
	}.bind(this), true);

	/*
	 * Listener for Callback removeFriend
	 */
	websocket.addListener("removeFriend", function(steamid, async) {
		if(this.checkLoggedIn(async)) {
			database.getUserBySteamID(steamid, function(err, friend) {
				if(!checkError(err, async)) {
					if(friend !== undefined) {
						database.removeFriend(this.user.id, friend.id, function(err) {
							if(!checkError(err, async)) {
								async({
									okay : true
								});
								server.broadcastToUser(steamid, "updated", "friends");
							}
						});
					}
					else {
						async({
							okay : false,
							reason : "user_unknown"
						});
					}
				}
			}.bind(this));
		}
	}.bind(this), true);
	websocket.addCloseListener(function() {
		server.removeClient(this);
	}.bind(this));
	/*
	 * Listener for enabeling an user
	 */
	websocket.addListener("enableUser", function(steamid, async) {
		this.checkAdmin(function() {
			database.getUserBySteamID(steamid, function(err, toEnable) {
				if(!checkError(err, async)) {
					if(toEnable !== undefined) {
						database.enableUser(toEnable.id, function(err) {
							if(!checkError(err, async)) {
								async({
									okay : true
								});
							}
						});
					}
					else {
						async({
							okay : false,
							reason : "user_unknown"
						});
					}
				}
			});
		}.bind(this), async);
	}.bind(this), true);
	/*
	 * Listener for disabeling users
	 */
	websocket.addListener("disableUser", function(steamid, async) {
		this.checkAdmin(function() {
			database.getUserBySteamID(steamid, function(err, toEnable) {
				if(!checkError(err, async)) {
					if(toEnable !== undefined) {
						database.disableUser(toEnable.id, function(err) {
							if(!checkError(err, async)) {
								server.broadcastToUser(steamid, "reload");
								var list = server.getUserClients(steamid);
								for(var u in list) {
									list[u].logout();
								}
								async({
									okay : true
								});
							}
						});
					}
					else {
						async({
							okay : false,
							reason : "user_unknown"
						});
					}
				}
			});
		}.bind(this), async);
	}.bind(this), true);
	/*
	 * Listener for getTime
	 */
	websocket.addListener("getTime", function(obj) {
		return server.cache.time;
	});
	/*
	 * Listener for getKnownPlayers
	 */
	websocket.addListener("getKnownPlayers", function(obj) {
		return server.cache.knownPlayers;
	});
	/*
	 * Listener for getInfo
	 */
	websocket.addListener("getInfo", function(obj) {
		return server.cache.info;
	});
	/*
	 *	Listener for getPlayers
	 */
	websocket.addListener("getPlayers", function(obj, async) {
		function done() {
			async({
				okay : true,
				players : visiblePlayers
			});
		}

		function decCounter() {
			counter--;
			if(counter === 0) {
				done();
			}
		}

		var thisClient = this;

		function handlePlayer(err, playerDB) {
			if(!checkError(err, async)) {
				if(playerDB !== undefined) {
					database.areFriends(thisClient.user.id, playerDB.id, function(err, f) {
						if(!checkError(err)) {
							if(f) {
								visiblePlayers.push(player);
							}
						}
						decCounter();
					});
				}
			}
		}

		if(this.checkLoggedIn(async)) {
			var visiblePlayers = [];
			var plEx =  server.cache.playersExtended;
			var counter = plEx.length;
			for(var i in plEx) {
				var player = plEx[i];
				if(player.steamid === this.user.steamid) {
					visiblePlayers.push(player);
					decCounter();
				}
				else {
					database.getUserBySteamID(player.steamid, handlePlayer);
				}
			}
		}
	}.bind(this), true);
	/*
	 * Listener for getUser
	 */
	websocket.addListener("getUserData", function(obj, async) {
		if(this.checkLoggedIn(async)) {
			async({
				okay : true,
				user : this.user
			});
		}
	}.bind(this), true);
	/*
	 * Listener for getUsers
	 */
	websocket.addListener("getUsers", function(obj, async) {
		if(this.checkLoggedIn(async)) {
			this.database.getUsers(this.user.id, function(err, users) {
				if(!checkError(err, async)) {
					async({
						okay : true,
						users : users
					});
				}
			}.bind(this));
		}
	}.bind(this), true);
	/*
	 * Listener for addAdmin
	 */
	websocket.addListener("addAdmin", function(steamid, async) {
		this.checkAdmin(function() {
			database.getUserBySteamID(steamid, function(err, toBeAdmin) {
				if(!checkError(err, async)) {
					if(toBeAdmin !== undefined) {
						database.addAdmin(toBeAdmin.id, function(err) {
							if(!checkError(err, async)) {
								async({
									okay : true
								});
								server.broadcastToUser(steamid, "reload", undefined);
							}
						});
					}
					else {
						async({
							okay : false,
							reason : "user_unknown"
						});
					}
				}
			});
		}.bind(this), async);
	}.bind(this), true);
	/*
	 * Listener for removeAdmin
	 */
	websocket.addListener("removeAdmin", function(steamid, async) {
		this.checkAdmin(function() {
			database.getUserBySteamID(steamid, function(err, toBeNoAdmin) {
				if(!checkError(err, async)) {
					if(toBeNoAdmin !== undefined) {
						database.removeAdmin(toBeNoAdmin.id, function(err) {
							if(!checkError(err, async)) {
								async({
									okay : true
								});
								server.broadcastToUser(steamid, "reload", undefined);
							}
						});
					}
					else {
						async({
							okay : false,
							reason : "user_unknown"
						});
					}
				}
			});
		}.bind(this), async);
	}.bind(this), true);
}

/**
 * Async answer. This is a method provided from the websocket as async return
 * for the request the remote end did. If it is called, the request will be
 * answered with the data provided and closed.
 * @callback Client~AsyncAnswer
 * @param {*} data - Any data. Will be sent as answer to the request.
 */
/**
 * Will be called once a validation is done.
 * @callback Client~ValidationCallback
 * @param {boolean} result - Whether the validation has succeeded.
 */
/**
 * Called when an action without a return value has finished.
 * @callback Client~VoidCallback
 */
/**
 * Will broadcast the removal of a marker to all users that are authorized
 * to receive this event (depending on visibility and friendships).
 * @param {number} id - Id of the marker to remove
 * @param {boolean} friendsOnly - Whether this marker is friendsonly or public
 * @param {Client~VoidCallback} callback - Called when this action has finished
 *										   and all messages were queued to be sent.
 */
Client.prototype.broadcastRemoveMarker = function(id, friendsOnly, callback) {
	var self = this;
	var j = this.server.clients.length;
	function decrease() {
		j--;
		if(j === 0) {
			callback();
		}
	}
	function sendMarker(client) {
		if(friendsOnly && client.user.id !== self.user.id) {
			self.database.areFriends(client.user.id, self.user.id, function(err, okay) {
				if(!err && okay) {
					client.sendRemoveMarker(id);
				}
				decrease();
			});
		}
		else {
			client.sendRemoveMarker(id);
			decrease();
		}
	}
	for(var i in this.server.clients) {
		var client = this.server.clients[i];
		if(client.isLoggedIn()) {
			sendMarker(client);
		}
		else {
			decrease();
		}
	}
};

/**
* Will broadcast the adding of a marker to all users that are authorized
* to receive this event (depending on visibility and friendships).
* @param {Database~Marker} marker - Marker that will be broadcast.
* @param {boolean} friendsOnly - Whether this marker is friendsonly or public
* @param {Client~VoidCallback} callback - Called when this action has finished
*										  and all messages were queued to be sent.
*/
Client.prototype.broadcastMarker = function(marker, friendsOnly, callback) {
	var self = this;
	var j = this.server.clients.length;
	function decrease() {
		j--;
		if(j === 0) {
			callback();
		}
	}
	function sendMarker(client) {
		if(friendsOnly && client.user.id !== self.user.id) {
			self.database.areFriends(client.user.id, self.user.id, function(err, okay) {
				if(!err && okay) {
					client.sendMarker(marker);
				}
				decrease();
			});
		}
		else {
			client.sendMarker(marker);
			decrease();
		}
	}
	for(var i in this.server.clients) {
		var client = this.server.clients[i];
		if(client.isLoggedIn()) {
			sendMarker(client);
		}
		else {
			decrease();
		}
	}
};

/**
 * Checks whether this client is the user associated with the steamid provided.
 * @param {string} steamid - Steam64 Id to test this client with.
 * @return {boolean} Whether this client is associated with the steamid provided.
 */
Client.prototype.isUser = function(steamid) {
	//jshint ignore:start
	return this.isLoggedIn() && this.user.steamid == steamid; //== instead of === needed as string may be passed
	//jshint ignore:end
};
/**
 * Check whether this client is logged in into an account with admin privileges.
 * @param {Client~ValidationCallback} callback - Called once the check was done.
 * @param {Client~AsyncAnswer} async - Called if an error happens to terminate the request.
 */
Client.prototype.checkAdmin = function(callback, async) {
	if(!this.isLoggedIn()) {
		callback(false);
	}
	else {
		this.database.validateAdmin(this.user.id, function(err, admin) {
			if(!checkError(err, async)) {
				if(admin) {
					callback(admin);
				}
				else {
					async({
						okay : false,
						reason : "no_admin"
					});
				}
			}
		});
	}
};

function checkError(err, async) {
	if(!err) {
		return undefined;
	}
	else {
		async({
			okay : false,
			reason : "internal_error"
		});
		return err;
	}
}

/**
 * Check whether this client is a logged in user or just a guest.
 * @return {boolean} Whether the client is logged in.
 */
Client.prototype.isLoggedIn = function() {
	return this.user !== undefined;
};

/**
 * Will check whether this client is logged in and if not send the corresponding
 * error message to the requester.
 * @param {Client~AsyncAnswer} - Called when the user is not logged in to terminate
 * 								 the request with the corresponding error message.
 * @return {boolean} - True if the client is logged in.
 */
Client.prototype.checkLoggedIn = function(async) {
	if(this.user === undefined) {
		async({
			okay : false,
			reason : "no_login"
		});
		return false;
	}
	else {
		return true;
	}
};

/**
 * Send a certain event to the remote end without listening for an answer.
 * @param {string} action - The name of the event to send
 * @param {*} obj - Any data that should be sent along with the event.
 */
Client.prototype.sendEvent = function(action, obj) {
	this.websocket.send(action, obj);
};

/**
 * Load the user specified by the username from the database and set this
 * instance into logged in state. This also performs a check whether the
 * user with the Id 1 is admin and enabled and fix this if he is not.
 * @param {string} username - Username to load user for
 * @param {Client~VoidCallback} callback - Called once the user was loaded and
 *										   this instance is in logged in state.
 */
Client.prototype.loadUser = function(username, callback) {
	this.database.getUserByName(username, function(err, user) {
		if(!err) {
			this.user = user;
			if(user.id === 1) {
				if(!user.admin) {
					this.database.addAdmin(user.id, function() {
						Winston.info("First registered user was granted adminprivileges.");
						this.loadUser(username, callback);
					}.bind(this));
				}
				else if(!user.enabled) {
					this.database.enableUser(user.id, function() {
						Winston.info("First registered user was enabled.");
						this.loadUser(username, callback);
					}.bind(this));
				}
				else {
					callback();
				}
			}
			else {
				callback();
			}
		} //TODO: Errorhandlers
	}.bind(this));
};

/**
 * Will log this client out.
 */
Client.prototype.logout = function() {
	delete this.user;
};

/**
 * Send the removal of a marker to the remote end.
 * @param {number} id - Id of the removed marker
 */
Client.prototype.sendRemoveMarker = function(id) {
	this.websocket.send("removeMarker", id);
};

/**
 * Send a new marker to the remote end.
 * @param {Database~Marker} marker - The marker to send
 */
Client.prototype.sendMarker = function(marker) {
	this.websocket.send("marker", marker);
};

module.exports = Client;
