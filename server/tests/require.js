var Winston = require('winston');

function fillZero(number, len) {
	number = "" + number;
	while(number.length < len) {
		number = "0" + number;
	}
	return number;
}

Winston.add(Winston.transports.File, {
	filename : 'server_test.log',
	maxsize : '512000',
	maxFiles : 7,
	json: false,
	colorize: true,
	timestamp: function() {
		var d = new Date();
		return d.getYear() + 1900 + "-" + fillZero(d.getMonth() + 1, 2) + "-" + fillZero(d.getDate(), 2) + " " +
		fillZero(d.getHours(), 2) + ":" + fillZero(d.getMinutes(), 2) + ":" + fillZero(d.getSeconds(),2);
	}
});

Winston.remove(Winston.transports.Console);

require("../src/server.js");
