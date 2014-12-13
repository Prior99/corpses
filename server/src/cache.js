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
 * This cache will save informations transmitted from the telnetconnection to the
 * 7DTD server. It will trigger the refreshing of these information automatically
 * every few seconds.
 *
 * @module Cache
 */
/**
 * Initialize the cache with a number of intervals that indicate how often the
 * information stored by this cache should be polled from the 7DTD server.
 * @constructor
 * @param {object} times - Information about the duration of the intervals.
 * 						   This specifies how often the information of the cache should be refreshed,
 * @param {number} times.timeInterval - How often the time of the server should be refreshed in milliseconds
 * @param {number} times.knownPlayersInterval - How often the list of known players should be refreshed in milliseconds
 * @param {number} times.playersExtendedInterval - How often the the information about all connected players should be refreshed in milliseconds
 */
function Cache(times) {
	this.times = times;
	this.time = undefined;
	this.knownPlayers = [];
	this.playersExtended = [];
	this.info = undefined;
	this.intervals = {};
}

/**
 * This method should be called whenever the connection to the 7DTD server was
 * lost. This will clear all intervals and reset the connection.
 */
Cache.prototype.connectionLost = function() {
	this.telnetClient = undefined;
	clearInterval(this.intervals.timeInterval);
	clearInterval(this.intervals.knownPlayersInterval);
	clearInterval(this.intervals.playersExtendedInterval);
};

/**
 * This method should be called to refresh the connection this cache gathers
 * it's information from. The connection will be stored and intervals to
 * refresh the cached data will be initialized.
 * @param {TelnetClient} telnetClient - The connection that was established and
 * 									    should now be used to gather information
 * 										from.
 */
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
