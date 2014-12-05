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
						if(!checkError(err, async)) {
							if(result.visbility === 'friends') {
								this.broadcastRemoveMarker(id, true, done);
							}
							else if(result.visibility === 'public') {
								this.broadcastRemoveMarker(id, false, done);
							}
							else {
								done();
							}
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
								async({
									okay : true
								});
								server.broadcastToUser(steamid, "reload");
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
				if(playerDB === undefined) {
					decCounter();
					Winston.error("Unknown player on the server");
					async({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
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
			else {
				decCounter();
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

Client.prototype.isUser = function(steamid) {
	return this.isLoggedIn() && this.user.steamid === steamid;
};

Client.prototype.checkAdmin = function(callback, async) {
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

Client.prototype.isLoggedIn = function() {
	return this.user !== undefined;
};

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

Client.prototype.sendEvent = function(action, obj) {
	this.websocket.send(action, obj);
};

Client.prototype.loadUser = function(username, callback) {
	this.database.getUserByName(username, function(err, user) {
		if(!err) {
			this.user = user;
			if(user.id === 1) {
				if(!user.admin) {
					this.database.addAdmin(user.id, function() {
						Winston.info("First registered user was granted adminprivileges.");
						callback();
					});
				}
				else if(!user.enabled) {
					this.database.enableUser(user.id, function() {
						Winston.info("First registered user was enabled.");
						callback();
					});
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

Client.prototype.sendRemoveMarker = function(id) {
	this.websocket.send("removeMarker", id);
};

Client.prototype.sendMarker = function(marker) {
	this.websocket.send("marker", marker);
};

module.exports = Client;
