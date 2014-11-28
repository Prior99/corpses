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
					this.loadUser(obj.name);
					async({
						okay : true
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
					this.loadUser(obj.name);
					async({
						okay : true
					});
					server.notifyNewUser();
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
					if(!checkError(err, async)) {
						this.server.broadcastMarker(result);
						async({
							okay : true
						});
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
				database.removeMarker(id, this.user.id, function(err, result) {
					this.server.broadcastRemoveMarker(id);
					if(!checkError(err, async)) {
						async({
							okay : true
						});
					}
				}.bind(this))
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
	 * Listener for Callback getFriendsOf
	 */
	websocket.addListener("getFriendsOf", function(obj, async) {
		if(this.checkLoggedIn(async)) {
			database.getFriendsOf(this.user.id, function(err, friends) {
				if(!checkError(err, async)) {
					async({
						okay : true,
						friends : friends
					});
				}
			});
		}
	}.bind(this), true);
	/*
	 * Listener for Callback getFriendsBy
	 */
	websocket.addListener("getFriendsBy", function(obj, async) {
		if(this.checkLoggedIn(async)) {
			database.getFriendsBy(this.user.id, function(err, friends) {
				if(!checkError(err, async)) {
					async({
						okay : true,
						friends : friends
					});
				}
			});
		}
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
	}.bind(this));

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
	}.bind(this));
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
		if(this.checkLoggedIn(async)) {
			var visiblePlayers = [];
			var counter = 0;

			function done() {
				async({
					okay : true,
					players : visiblePlayers
				});
			}

			function decCounter() {
				counter--;
				if(counter == 0) {
					done();
				}
				if(counter < 0) {
					console.error("Error: Counter lower than 0");
				}
			}

			for(var i in server.cache.playersExtended) {
				var player = server.cache.playersExtended[i];
				counter++;
				if(player.steamid == this.user.steamid) {
					visiblePlayers.push(player);
					decCounter();
				}
				else {
					database.getUserBySteamID(player.steamid, function(err, playerDB) {
						if(!checkError(err, async)) {
							if(playerDB == undefined) {
								decCounter();
								console.error("Unknown player on the server");
								async({
									okay : false,
									reason : "internal_error"
								});
							}
							else {
								database.isFriendOf(this.user.id, playerDB.id, function(err, f) {
									if(!checkError(err)) {
										if(f) {
											visiblePlayers.push(player);
										}
									}
									decCounter();
								})
							}
						}
						else {
							decCounter();
						}
					});
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
};

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

Client.prototype.loadUser = function(username) {
	this.database.getUserByName(username, function(err, user) {
		if(!err) {
			this.user = user;
		}
	}.bind(this));
};

Client.prototype.sendRemoveMarker = function(id) {
	this.websocket.send("removeMarker", id);
};

Client.prototype.sendMarker = function(marker) {
	var me = this;
	function send() {
		me.websocket.send("marker", marker);
	};
	if(marker.visibility == "public") {
		send();
	}
	else if(marker.visibility == "friends") {
		this.database.isFriendOf(this.user.id, marker.author, function(err, okay) {
			send();
		});
	}
	else if(marker.visibility == "private") {
		if(marker.author == this.user.id) {
			send();
		}
	}
	else {
		console.error("Assert failed: invalid visibility of marker");
	}
};

module.exports = Client;
