var UI = {
	playerRowMapping : {}
};

UI.updateInfo = function(obj) {
	$("#players").html(obj.players);
	$("#zombies").html(obj.zombies);

	$("#fps").html(obj.fps);
	$("#memory").html(parseInt(obj.memoryUsed*100/obj.memoryMax) + "% of " + obj.memoryMax + "MB");
	$("#chunks").html(obj.chunks);
	$("#entities").html(obj.entitiesLoaded + "/" + obj.entitiesOverall);
	$("#items").html(obj.items);
};


UI.updateTime = function(obj) {
	$("#time").html("Day " + obj.day + ", " + obj.hour + ":" + obj.minute);
};

UI.updateKnownPlayers = function(players) {
	var div = $("#knownPlayers");
	div.html("");
	for(var i in players) {
		var player = players[i];
		div.append("<p>" + player.name + "</p>");
	}
};

UI.updatePlayers = function(players) {

};

UI.updatePlayer = function(player) {
	var row;
	if((row = UI.playerRowMapping[player.id]) == undefined) {
		row = $("<tr></tr>").appendTo("#playerTable");
		UI.playerRowMapping[player.id] = row;
	}
	row.html(
		"<td>" + player.number + "</td>" +
		"<td>" + player.name + "</td>" +
		"<td style='background: rgba(200, 200, 200, 0.5);'>" + parseInt(player.position.x) + "</td>" +
		"<td style='background: rgba(200, 200, 200, 0.5);'>" + parseInt(player.position.y) + "</td>" +
		"<td style='background: rgba(200, 200, 200, 0.5);'>" + parseInt(player.position.z) + "</td>" +
		"<td>" + player.deaths + "</td>" +
		"<td>" + player.health + "</td>" +
		"<td>" + player.zombieKills + "/" + player.playerKills + "</td>" +
		"<td>" + player.score + "</td>" +
		"<td>" + player.playtime + "min</td>" +
		"<td>" + player.ping + "ms</td>"
	);
}
