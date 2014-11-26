var Map = {
	size : 16,
	nativeZoom : 4,
	projection : {
		project: function (latlng) {
			return new L.Point((latlng.lat + 2) / Math.pow(2, Map.nativeZoom), (latlng.lng - 1) / Math.pow(2, Map.nativeZoom));
		},
		unproject: function (point) {
			return new L.LatLng(point.x * Math.pow(2,Map. nativeZoom) - 2, point.y * Math.pow(2, Map.nativeZoom) + 1);
		}
	},
	markers : {},
	playerMapping : {}
};

Map.newPlayerMapping = function(player) {
	var icon = new L.userIcon({
		number : UI.playerMapping[player.steamid].number,
		rotation : player.rotation.y
	});
	var marker = L.marker([player.position.x, player.position.z], {
		icon: icon,
		zIndexOffset : 1000
	});
	marker.addTo(Map.map);
	var mapping = {
		playerObjec : player,
		marker : marker,
		icon : icon
	};
	Map.playerMapping[player.steamid] = mapping;
	return mapping;
};

Map.updatePlayers = function(players) {
	for(var i in players) {
		var player = players[i];
		var mapping;
		if(!(mapping = Map.playerMapping[player.steamid])) {
			mapping = Map.newPlayerMapping(player);
		}
		mapping.marker.setLatLng([player.position.x, player.position.z]);
		mapping.icon.setRotation(player.rotation.y);
	}
};

Map.removePlayerMapping = function(steamid) {
	var mapping = Map.playerMapping[steamid];
	Map.map.removeLayer(mapping.marker);
	delete Map.playerMapping[steamid];
};

Map.reloadMarkers = function() {
	Websocket.send("fetchMarkers", undefined, function(obj) {
		if(obj.okay) {
			Map.clearMarkers();
			Map.displayMarkers(obj.markers);
		}
		else {
			//TODO Error handling
		}
	});
};

Map.clearMarkers = function() {
	var arr = [];
	for(var id in Map.markers) {
		arr.push(id);
	}
	for(var id in arr) {
		Map.removeMarker(id);
	}
};

Map.init = function() {
	$.getJSON("map/mapinfo.json", function(json) {
		Map.initLeaflet(json);
		Map.reloadMarkers();
	});
	Websocket.addMessageListener("marker", function(obj) {
		Map.displayMarker(obj);
	});
	Websocket.addMessageListener("removeMarker", function(id) {
		Map.removeMarker(id);
	});
};

Map.initLeaflet = function(param) {
	Map.crs = L.extend({}, L.CRS.Simple, {
		projection: Map.projection,
		scale: function(zoom) {
			return Math.pow(2, zoom);
		}
	});
	Map.map = L.map('map', {
		center : [0, 0],
		zoomControl: false,
		zoom : Map.nativeZoom / 2,
		crs : Map.crs,
		minZoom: 1,
		maxZoom: param.maxZoom,
		layers : [
			L.tileLayer('map/{z}/{x}/{y}.png', {
				tileSize: param.blockSize,
				minZoom: 1,
				maxZoom: param.maxZoom,
				noWrap: true,
				tms: true,
				continuousWorld : true,
			})
		]
	});
	Map.map.on("contextmenu", function(e) {
		Map.displayCreateMarkerInterface(e.latlng);
	});
};

Map.getMarkerIcon = function(iconID, visibility) {
	var icon;
	var color;
	switch(visibility) {
		case "private":
			color = "red";
			break;
		case "public":
			color = "green";
			break;
		case "friends":
			color = "orange";
			break;
	}
	icon = L.AwesomeMarkers.icon({
		icon : iconID,
		prefix: 'fa',
		markerColor : color
	});
	return icon;
};

Map.removeMarker = function(id) {
	var marker = Map.markers[id];
	if(marker) {
		Map.map.removeLayer(marker.markerElement);
		delete Map.markers[id];
	}
};

Map.invokeRemoveMarker = function(marker, popup) {
	NET.removeMarker(marker.id, function() {
		Map.map.removeLayer(popup);
	});
};

Map.ignoreMarker = function(marker, popup) {
	NET.ignoreMarker(marker.id, function() {
		Map.map.removeLayer(popup);
		Map.removeMarker(marker.id);
	});
};

Map.displayMarker = function(marker) {
	var icon = Map.getMarkerIcon(marker.icon, marker.visibility);
	var popup;
	//TODO: Edit marker
	var elem = $("<div></div>")
	elem.append($("<h1>" + marker.name + "</h1><p>" + marker.description + "</p>"));
	if(marker.author === Login.getUser().id) {
		elem.append($("<a href='#'>Remove</a>").click(function() {
			elem.html("<img src='img/loading.gif' />");
			Map.invokeRemoveMarker(marker, popup);
		}));
	}
	else {
		elem.append($("<a href='#'>Ignore</a>").click(function() {
			elem.html("<img src='img/loading.gif' />");
			Map.ignoreMarker(marker, popup);
		}));
	}
	popup = L.popup().setContent(elem[0]);
	var markerElement = L.marker([marker.lat, marker.lng], {
		icon : icon
	});
	markerElement.bindPopup(popup)
	markerElement.addTo(Map.map);
	Map.markers[marker.id] = marker;
	Map.markers[marker.id].markerElement = markerElement;
};

Map.displayMarkers = function(markers) {
	for(var i in markers) {
		var marker = markers[i];
		Map.displayMarker(marker);
	}
};

Map.displayCreateMarkerInterface = function(latlng) {
	var popup;
	var wrapper = $("<div></div>");
	var loader = $("<img src='img/loading.gif' />").hide().appendTo(wrapper);
	elem = $($("#templateCreateMarker").html());
	elem.appendTo(wrapper);
	elem.find("#create").click(function() {
		elem.hide();
		loader.show();
		NET.addMarker({
			lat : latlng.lat,
			lng : latlng.lng,
			name : elem.find("#name").val(),
			description : elem.find("#description").val(),
			icon : elem.find("#icon").val(),
			visibility : elem.find("#visibility").val()
		}, function(okay) {
			if(okay) {
				Map.map.removeLayer(popup);
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
		.openOn(Map.map);
};
