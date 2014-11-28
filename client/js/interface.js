var UI = {
	playerMapping : {},
	playerNumbers : [],
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

UI.updateUsers = function(users) {
	var div = $("#users");
	div.html("<tr><td>Name</td><td>Enabled</td><td>Admin</td><td>Your Friend</td><td>Friend of yours</td></tr>");

	var adminRow = $("<td>" + player.admin + "</td>");
	var friendRow = $("<td>" + player.friend + "</td>")
		.click(function() {
			NET.toggleFriend(player);
		})
		.css({"cursor" : "pointer"});
	var enabledRow = $("<td>" + player.enabled + "</td>");
	if(Login.getUser().admin) {
		adminRow
			.click(function() {
				NET.toggleAdmin(player);
			})
			.css({"cursor" : "pointer"});
		enabledRow
			.click(function() {
				NET.toggleEnabled(player);
			})
			.css({"cursor" : "pointer"});
	}
	function updateUserHTML(player) {
		div.append($("<tr></tr>")
			.append("<td>" + player.name + "</td>")
			.append(enabledRow)
			.append(adminRow)
			.append("<td>" + player.friendedBy + "</td>")
			.append(friendRow)
		));
	}

	for(var i in users) {
		updateUserHTML(players[i]);
	}
};

UI.updateTime = function(obj) {
	$("#time").html("Day " + obj.day + ", " + obj.hour + ":" + obj.minute);
};

UI.updateKnownPlayers = function(players) {
	//TODO: Stub
};

UI.generatePlayerNumber = function() {
	for(var number = 0;;number ++) {
		if(UI.playerNumbers.indexOf(number) === -1) {
			UI.playerNumbers.push(number);
			return number;
		}
	}
};

UI.freePlayerNumber = function(number) {
	UI.playerNumbers.splice(UI.playerNumbers.indexOf(number), 1);
};

UI.generatePlayerRow = function() {
	return $("<tr></tr>").appendTo("#playerTable");
};

UI.newPlayerMapping = function(player) {
	if(UI.playerNumbers.length === 0) {
		$("#noplayers").hide();
	}
	var mapping = {
		number : UI.generatePlayerNumber(),
		row : UI.generatePlayerRow(),
		playerObject : player
	};
	UI.playerMapping[player.steamid] = mapping;
};

UI.removePlayerMapping = function(steamid) {
	var mapping = UI.playerMapping[steamid];
	mapping.row.remove();
	UI.freePlayerNumber(mapping.number);
	delete UI.playerMapping[steamid];
	if(UI.playerNumbers.length === 0) {
		$("#noplayers").show();
	}
};

UI.updatePlayers = function(players) {
	for(var i in players) {
		var player = players[i];
		var mapping;
		if(!(mapping = UI.playerMapping[player.steamid])) {
			mapping = UI.newPlayerMapping(player);
		}
		if(mapping) {
			UI.updatePlayer(mapping);
		}
	}
};

UI.updatePlayer = function(mapping) {
	var player = mapping.playerObject;
	mapping.row.html(
		"<td>" + mapping.number + "</td>" +
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
};

UI.firePopup = function(obj) {
	var popup = $($("#templatePopup").html()).prependTo($(".stack"));
	popup.find("h1").html(obj.headline ? obj.headline : "");
	popup.find(".text").html(obj.text ? obj.text : "");
	popup.find(".icon").addClass(obj.icon ? obj.icon : "fa-bell");
	popup.find(".close").click(function() {
		popup.close();
	});
	popup.close = function() {
		popup.css({"opacity" : "0"});
		setTimeout(function() {
			popup.remove();
		}, 300);
	};
	setTimeout(function() {
		popup.close();
	}, obj.timeout ? obj.timeout*1000 : 10000);
};
