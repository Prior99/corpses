var Winston = require('winston');

function fillZero(number, len) {
	number = "" + number;
	while(number.length < len) {
		number = "0" + number;
	}
	return number;
}

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, {
	colorize: true,
	timestamp: function() {
		var d = new Date();
		return d.getYear() + 1900 + "-" + fillZero(d.getMonth() + 1, 1) + "-" + fillZero(d.getDate(), 2) + " " +
		fillZero(d.getHours(), 2) + ":" + fillZero(d.getMinutes(), 2) + ":" + fillZero(d.getSeconds(),2);
	}
});

Winston.add(Winston.transports.File, {
	filename : 'server.log',
	maxsize : '64000',
	maxFiles : 7,
	json: false,
	colorize: true,
	timestamp: function() {
		var d = new Date();
		return d.getYear() + 1900 + "-" + fillZero(d.getMonth() + 1, 2) + "-" + fillZero(d.getDate(), 2) + " " +
		fillZero(d.getHours(), 2) + ":" + fillZero(d.getMinutes(), 2) + ":" + fillZero(d.getSeconds(),2);
	}
});
