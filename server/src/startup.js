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
var TelnetClient = require("./7dtd.js");
var Database = require("./database.js");
var Cache = require("./cache.js");
var Server = require("./server.js");
var config = require("../config.json");

Winston.add(Winston.transports.File, {
	filename : 'server.log',
	maxsize : '512000',
	maxFiles : 7,
	json: false,
	colorize: true,
	timestamp: function() {
		var d = new Date();
		return d.getYear() + "." + (d.getMonth() + 1) + "." + d.getDate() + " " +
		d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
	}
});

var cache = new Cache({time : 5000, knownPlayers : 10000, playersExtended : 1000});
var telnetClient = new TelnetClient(config);
var database = new Database(config, function() {
	new Server(cache, telnetClient, database, config);
	telnetClient.connect();
});
