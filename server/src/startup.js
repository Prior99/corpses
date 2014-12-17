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
var TelnetClient = require("./telnetclient.js");
var Database = require("./database.js");
var Cache = require("./cache.js");
var Server = require("./server.js");
var config = require("../config.json");
require("./preparewinston.js");

var cache = new Cache({time : 5000, knownPlayers : 10000, playersExtended : 1000});
var telnetClient = new TelnetClient(config);
var database = new Database(config.database, function(okay) {
	if(okay) {
		var serv = new Server(cache, telnetClient, database, config);
		serv.on('error', function() {
			Winston.info("Server emitted error. Shutting down.");
			serv.shutdown();
		});
		telnetClient.on('error', function() {
			Winston.info("Telnetclient emitted error. Shutting down.");
			serv.shutdown();
		});
		telnetClient.connect();
	}
	else {
		Winston.info("Not starting without connection to database.");
	}
});
