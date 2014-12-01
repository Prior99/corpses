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
	div.click(function(e) {
		e.stopPropagation();
		e.preventDefault();
		return false;
	});
	div.html("<tr>" +
		"<td><i class='fa fa-user'></i></td>" +
		"<td><i class='fa fa-check-circle'></td>" +
		"<td><i class='fa fa-gavel'></i></td>" +
		"<td><i class='fa fa-heart'></i></td>" +
	"</tr>");
	function boolToSymbol(bool) {
		if(bool) {
			return "<i class='fa fa-check'></i>";
		}
		else {
			return "<i class='fa fa-times'></i>";
		}
	}

	function friendSymbol(send, recv) {
		if(send && recv) {
			return "<i class='fa fa-check'></i>";
		}
		else if(!send && !recv){
			return "<i class='fa fa-times'></i>";
		}
		else if(send && !recv){
			return "<i class='fa fa-exclamation'></i>";
		}
		else if(!send && recv){
			return "<i class='fa fa-question'></i>";
		}
	}

	function updateUserHTML(user) {
		var adminRow = $("<td>" + boolToSymbol(user.admin) + "</td>");
		var friendRow = $("<td>" + friendSymbol(user.friend, user.friendedBy) + "</td>")
		.click(function() {
			NET.toggleFriend(user);
		})
		.css({"cursor" : "pointer"});
		var enabledRow = $("<td>" + boolToSymbol(user.enabled) + "</td>");
		if(Login.getUser().admin) {
			adminRow
			.click(function() {
				NET.toggleAdmin(user);
			})
			.css({"cursor" : "pointer"});
			enabledRow
			.click(function() {
				NET.toggleEnabled(user);
			})
			.css({"cursor" : "pointer"});
		}
		div.append($("<tr></tr>")
			.append("<td>" + user.name + "</td>")
			.append(enabledRow)
			.append(adminRow)
			.append(friendRow)
		);
	}

	for(var i in users) {
		updateUserHTML(users[i]);
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

UI.clearPlayers = function() {
	var arr = [];
	for(var i in UI.playerMappings) {
		arr.push(i);
	}
	for(var j in arr) {
		UI.removePlayerMapping(j);
	}
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
