var net = require("net");
var config = require("../config.json");

var Regexes = {
	//2708.932 Time: 45.01m FPS: 60.36 Heap: 234.5MB Max: 266.8MB Chunks: 0 CGO: 0 Ply: 0 Zom: 0 Ent: 0 (170) Items: 20
	info : new RegExp(
		'([0-9]+\\.?[0-9]*)\\s' +
		'Time:\\s([0-9]+\\.?[0-9]*)m\\s' +
		'FPS:\\s([0-9]+\\.?[0-9]*)\\s' +
		'Heap:\\s([0-9]+\\.?[0-9]*)[KMGTP]?B\\s' +
		'Max:\\s([0-9]+\\.?[0-9]*)[KMGTP]?B\\s' +
		'Chunks:\\s([0-9]+)\\s' +
		'CGO:\\s([0-9]+)\\s' +
		'Ply:\\s([0-9]+)\\s' +
		'Zom:\\s([0-9]+)\\s' +
		'Ent:\\s([0-9]+)\\s' +
		'\\(([0-9]+)\\)\\s' +
		'Items:\\s([0-9]+)')
};

function Connection() {
	console.log("2888.967 Time: 48.01m FPS: 60.36 Heap: 234.4MB Max: 266.8MB Chunks: 0 CGO: 0 Ply: 0 Zom: 0 Ent: 0 (170) Items: 20"
	.match(Regexes.info));
	return;
	this.client = new net.Socket();
	this.client.on("data", function(data) {
		this.parseMessage(data);
	}.bind(this));
	this.client.on("close", function() {
		console.log("Telnetclient closed.");
	}.bind(this));
	this.client.connect(config.telnetPort, config.telnetHost, function() {
		console.log("Telnetclient connected.");
	}.bind(this));
};

Connection.prototype.parseMessage = function(data) {
	var result;
	var string = data.toString();
	if(result = string.match(Regexes.info)) {
		console.log("!Regex found for: " + data);
		console.log(result);
	}
	else console.log("No regex found for: " + data);
};

module.exports = Connection;
