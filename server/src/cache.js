function Cache(server) {
	this.time = undefined;
	this.knownPlayers = undefined;
	this.playersExtended = undefined;
	this.info = undefined;
	this.intervals = {};
}

Cache.prototype.connectionLost = function() {
	this.telnetClient = undefined;
	clearInterval(this.intervals.timeInterval);
	clearInterval(this.intervals.knownPlayersInterval);
	clearInterval(this.intervals.playersExtendedInterval);
};

Cache.prototype.connectionEstablished = function(telnetClient) {
	this.telnetClient = telnetClient;
	var me = this;
	this.intervals.timeInterval = setInterval(function() {
		me.telnetClient.triggerGetTime();
	}, 7000);
	this.intervals.knownPlayersInterval = setInterval(function() {
		me.telnetClient.triggerListKnownPlayers();
	}, 10000);
	this.intervals.playersExtendedInterval = setInterval(function() {
		me.telnetClient.triggerListPlayersExtended();
	}, 3000);
	telnetClient.on("info", function(evt) {
		me.info = evt;
		console.log("Got info", evt);
	});
	telnetClient.on("listKnownPlayers", function(evt) {
		me.knownPlayers = evt;
		console.log("Got known players", evt);
	});
	telnetClient.on("getTime", function(evt) {
		me.time = evt;
		console.log("Got time", evt);
	});
	telnetClient.on("listPlayersExtended", function(evt) {
		me.playersExtended = evt;
		console.log("Got lpe", evt);
	});
};

module.exports = Cache;
