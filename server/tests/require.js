var Winston = require('winston');
Winston.remove(Winston.transports.Console);

Winston.add(Winston.transports.File, {
	filename : 'server_test.log',
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

require("../src/server.js");
