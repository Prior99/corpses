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
						reason : "name_already_taken"
					});
				}
			}
		}.bind(this));
	}.bind(this), true);

	/*
	 * Listener for Callback register
	 */
	websocket.addListener("register", function(obj, asyc) {
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
				}
			}.bind(this));
		}
		else {
			async({
				okay : false,
				reason : "invalid_arguments"
			});
		}
	}.bind(this));

	/*
	 * Listener for Callback addMarker
	 */
	websocket.addListener("addMarker", function(obj, async) {
		if(this.checkLoggedIn(async)) {
			if(!obj.icon || !obj.name || !obj.description || !obj.lat || !obj.lng) {
				async({
					okay : false,
					reason : "invalid_arguments"
				});
			}
			else {
				database.addMarker(obj, function(err, result) {
					if(!checkError(err, async)) {
						this.server.broadcastMarkers([result]);
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
					broadcastRemoveMarker(id);
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
	websocket.addListener("addFriend", function(username, async) {
		if(this.checkLoggedIn(async)) {
			database.getUserByName(username, function(err, friend) {
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
	websocket.addListener("removeFriend", function(username, async) {
		if(this.checkLoggedIn(async)) {
			database.getUserByName(username, function(err, friend) {
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

	websocket.addListener("enableUser", function(username, async) {
		//TODO
	}.bind(this), true);
}

Client.prototype.checkAdmin = function(callback, async) {
	this.database.validateAdmin(this.user.id, function(err, admin) {
		if(!checkError(err, async)) {
			callback(admin);
		}
	});
}

function checkError(err, async) {
	if(!err) {
		return true;
	}
	else {
		async({
			okay : false,
			reason : "internal_error"
		});
		return false;
	}
}

Client.prototype.isLoggedIn = function() {
	return this.user !== undefined;
}

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
}

Client.prototype.loadUser = function(username) {
	database.getUserByName(username, function(err, user) {
		if(!err) {
			this.user = user;
		}
	}.bind(this));
}

module.exports = Client;
