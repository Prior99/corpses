var size = 16;
var map;
var players = {};
var playerCount = 0;
var following;
var markerIcons = {};
var markers = {};
var playerNumber = 1;

function main() {
	Websocket.addMessageListener("info", updateInfo);
	Websocket.addMessageListener("spawningWanderingHorde", displayHordeWarning);
	Websocket.addMessageListener("listKnownPlayers", updateKnownPlayers);
	Websocket.addMessageListener("getTime", updateTime);
	Websocket.addMessageListener("listPlayersExtended", updatePlayerStats);
	Websocket.addMessageListener("playerConnected", function(obj) { });
	Websocket.addMessageListener("playerDisconnected", playerDisconnected);
	Websocket.addMessageListener("markers", displayMarkers);
	Websocket.addMessageListener("removeMarker", removeMarker);
	Websocket.addOpenListener(function() {
		console.log("Websocket connected!");
	});
	Websocket.init();

	$.getJSON("map/mapinfo.json", function(json) {
		initMap(json);
	});
}

function displayMarkers(array) {
	console.log(array);
	for(var i in array) {
		(function(marker) {
			var icon;
			if(!(icon = markerIcons[marker.icon])) {
				icon = L.AwesomeMarkers.icon({
					icon : marker.icon,
					prefix: 'fa',
					markerColor : "blue"
				});
				markerIcons[marker.icon] = icon;
			}
			var popup;
			var elem = $("<div></div>")
				.append($("<h1>" + marker.name + "</h1><p>" + marker.description + "</p>"))
				.append($("<a href='#'>Remove</a>").click(function() {
					elem.html("<img src='img/loading.gif' />");
					Websocket.send("removeMarker", {
						id : marker.id
					}, function() {
						map.removeLayer(popup);
					});
				}));

			popup = L.popup()
				.setContent(elem[0]);
			var lm = L.marker([marker.lat, marker.lng], {
				icon : icon
			})
			.bindPopup(popup)
			.addTo(map);
			marker.lmarker = lm;
			markers[marker.id] = marker;
		})(array[i]);
	}
}

function removeMarker(id) {
	var marker = markers[id];
	map.removeLayer(marker.lmarker);
	markers[id] = undefined;
}

function createMarker(latlng) {
	var popup;
	var wrapper = $("<div></div>");
	var loader = $("<img src='img/loading.gif' />").hide().appendTo(wrapper);
	elem = $($("#templateCreateMarker").html());
	elem.appendTo(wrapper);
	elem.find("#create").click(function() {
		elem.hide();
		loader.show();
		Websocket.send("addMarker", {
			lat : latlng.lat,
			lng : latlng.lng,
			name : elem.find("#name").val(),
			description : elem.find("#description").val(),
			icon : elem.find("#icon").val()
		}, function(answer) {
			if(answer.okay) {
				map.removeLayer(popup);
			}
			else {
				loader.hide();
				elem.show();
			}
		});
	});
	popup = L.popup()
		.setLatLng(latlng)
		.setContent(wrapper[0])
		.openOn(map);
}

function initMap(param) {
	var nativeZoom = 4;
	var projection = {
		project: function (latlng) {
			return new L.Point((latlng.lat + 2) / Math.pow(2, nativeZoom), (latlng.lng - 1) / Math.pow(2, nativeZoom));
		},
		unproject: function (point) {
			return new L.LatLng(point.x * Math.pow(2, nativeZoom) - 2, point.y * Math.pow(2, nativeZoom) + 1);
		}
	};
	var crs = L.extend({}, L.CRS.Simple, {
		projection: projection,
		scale: function (zoom) {
			return Math.pow(2, zoom);
		}
	});
	map = L.map('map', {
		center : [0, 0],
		zoomControl: false,
		zoom : 2,
		crs : crs,
		minZoom: 1,
		maxZoom: param.maxZoom,
		layers : [
			L.tileLayer('map/{z}/{x}/{y}.png', {
				tileSize: param.blockSize,
				minZoom: 1,
				maxZoom: 4,
				noWrap: true,
				tms: true,
				continuousWorld : true,
			})
		]
	});
	map.on("contextmenu", function(e) {
		createMarker(e.latlng);
	});
}

function updateInfo(obj) {
	$("#players").html(obj.players);
	$("#zombies").html(obj.zombies);

	$("#fps").html(obj.fps);
	$("#memory").html(parseInt(obj.memoryUsed*100/obj.memoryMax) + "% of " + obj.memoryMax + "MB");
	$("#chunks").html(obj.chunks);
	$("#entities").html(obj.entitiesLoaded + "/" + obj.entitiesOverall);
	$("#items").html(obj.items);
}

function displayHordeWarning() {

}

function followPlayer(player) {
	if(following !== undefined) {
		following.tableRow.css({
			background : "transparent"
		});
	}
	if(following == player) {
		following = undefined;
	}
	else {
		following = player;
		following.tableRow.css({
			background : "rgb(180, 180, 255)"
		});
	}
}

function updateKnownPlayers(obj) {
	for(var i in obj) {
		var player = obj[i];
		if(player.online) {
			if(players[player.name] == undefined) {
				players[player.name] = player;
				player.position = {
					x : "?",
					y : "?",
					z : "?",
				};
				player.score = "?";
				player.deaths = "?";
				player.health = "?";
				player.zombieKills = "?";
				player.playerKills = "?";
				player.ping = "?";
				player.number = playerNumber++;
				(function(player) {
					player.tableRow = $("<tr></tr>")
						.appendTo("#playerTable")
						.click(function() {
							followPlayer(player);
						});
				})(player);
				playerCount++;
				updatePlayer(player);
				$("#noplayers").hide();
			}
			else {
				var p = players[player.name];
				p.online = player.online;
				p.playtime = player.playtime;
			}
		}
	}
}

function updateTime(obj) {
	$("#time").html("Day " + obj.day + ", " + obj.hour + ":" + obj.minute);
}

function updatePlayerStats(obj) {
	for(var i in obj) {
		var player = obj[i];
		var marker;
		var p = players[player.name];
		if(p !== undefined) {
			if(p.marker == undefined) {
				p.marker = L.marker([0, 0], {
					icon: new L.NumberedDivIcon({
						number: p.number
					}),
					zIndexOffset : 1000
				}).addTo(map);
			}
			p.marker
				.setLatLng([player.position.x, player.position.z]);
			p.score = player.score;
			p.deaths = player.deaths;
			p.health = player.health;
			p.zombieKills = player.zombieKills;
			p.playerKills = player.playerKills;
			p.position = player.position;
			p.ping = player.ping;
			updatePlayer(p);
		}
	}
}

function updatePlayer(player) {
	player.tableRow.html(
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
		"<td>" + player.ping + "ms</td>");
	if(player == following) {
		map.setView([player.position.x, player.position.z]);
	}
}

function playerDisconnected(obj) {
	console.log(obj);
	var player;
	if((player = players[obj.name]) !== undefined) {
		map.removeLayer(player.marker);
		player.tableRow.remove();
		players[obj.name] = undefined;
		playerCount--;
		if(playerCount == 0) {
			$("#noplayers").show();
		}
	}
}
