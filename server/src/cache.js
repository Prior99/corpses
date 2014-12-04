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

function Cache(times) {
	this.times = times;
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
	}, this.times.time);
	this.intervals.knownPlayersInterval = setInterval(function() {
		me.telnetClient.triggerListKnownPlayers();
	}, this.times.knownPlayers);
	this.intervals.playersExtendedInterval = setInterval(function() {
		me.telnetClient.triggerListPlayersExtended();
	}, this.times.playersExtended);
	telnetClient.on("info", function(evt) {
		me.info = evt;
		//Winston.info("Got info", evt);
	});
	telnetClient.on("listKnownPlayers", function(evt) {
		me.knownPlayers = evt;
		//Winston.info("Got known players", evt);
	});
	telnetClient.on("getTime", function(evt) {
		me.time = evt;
		//Winston.info("Got time", evt);
	});
	telnetClient.on("listPlayersExtended", function(evt) {
		me.playersExtended = evt;
		//Winston.info("Got lpe", evt);
	});
};

module.exports = Cache;
