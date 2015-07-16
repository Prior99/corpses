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

var MapSystem = {
	size : 16,
	nativeZoom : 4,
	projection : {
		project: function (latlng) {
			return new L.Point((latlng.lat + 2) / Math.pow(2, MapSystem.nativeZoom), (latlng.lng - 1) / Math.pow(2, MapSystem.nativeZoom));
		},
		unproject: function (point) {
			return new L.LatLng(point.x * Math.pow(2,MapSystem.nativeZoom) - 2, point.y * Math.pow(2, MapSystem.nativeZoom) + 1);
		}
	},
	markers : {},
	playerMapping : {}
};

MapSystem.newPlayerMapping = function(player) {
	var icon = new L.userIcon({
		number : UI.playerMapping[player.steamid].number,
		rotation : player.rotation.y
	});
	var marker = L.marker([player.position.x, player.position.z], {
		icon: icon,
		zIndexOffset : 1000
	});
	marker.addTo(MapSystem.map);
	var mapping = {
		playerObjec : player,
		marker : marker,
		icon : icon
	};
	MapSystem.playerMapping[player.steamid] = mapping;
	return mapping;
};

MapSystem.follow = function(player) {
	MapSystem._following = player;
};

MapSystem.unfollow = function() {
	MapSystem._following = null;
};

MapSystem.updatePlayers = function(players) {
	for(var i in players) {
		var player = players[i];
		var mapping;
		if(!(mapping = MapSystem.playerMapping[player.steamid])) {
			mapping = MapSystem.newPlayerMapping(player);
		}
		mapping.marker.setLatLng([player.position.x, player.position.z]);
		mapping.icon.setRotation(player.rotation.y);
		if(MapSystem._following && MapSystem._following.id === player.id) {
			MapSystem.map.panTo([player.position.x, player.position.z]);
		}
	}
};

MapSystem.removePlayerMapping = function(steamid) {
	var mapping = MapSystem.playerMapping[steamid];
	MapSystem.map.removeLayer(mapping.marker);
	delete MapSystem.playerMapping[steamid];
};

MapSystem.reloadMarkers = function() {
	MapSystem.clearMarkers();
	Websocket.send("fetchMarkers", undefined, function(obj) {
		if(obj.okay) {
			MapSystem.displayMarkers(obj.markers);
		}
		else {
			Errors.displayError(obj.reason);
		}
	});
};

MapSystem.clearMarkers = function() {
	var arr = [];
	for(var id in MapSystem.markers) {
		arr.push(id);
	}
	for(var i in arr) {
		MapSystem.removeMarker(arr[i]);
	}
};

MapSystem.init = function() {
	$.getJSON("map/mapinfo.json", function(json) {
		MapSystem.initLeaflet(json);
		MapSystem.reloadMarkers();
	});
	Websocket.addMessageListener("marker", function(obj) {
		MapSystem.displayMarker(obj);
	});
	Websocket.addMessageListener("removeMarker", function(id) {
		MapSystem.removeMarker(id);
	});
};

MapSystem.initLeaflet = function(param) {
	MapSystem.crs = L.extend({}, L.CRS.Simple, {
		projection: MapSystem.projection,
		scale: function(zoom) {
			return Math.pow(2, zoom);
		}
	});
	MapSystem.mapLayer = L.tileLayer('map/{z}/{x}/{y}.png', {
		tileSize: param.blockSize,
		minZoom: 1,
		maxZoom: param.maxZoom,
		noWrap: true,
		tms: true,
		continuousWorld : true
	});
	MapSystem.map = L.map('map', {
		center : [0, 0],
		zoomControl: false,
		zoom : MapSystem.nativeZoom / 2,
		crs : MapSystem.crs,
		minZoom: 1,
		maxZoom: param.maxZoom,
		layers : [
			MapSystem.mapLayer
		]
	});
	MapSystem.map.on("contextmenu", function(e) {
		MapSystem.displayCreateMarkerInterface(e.latlng);
	});
};

MapSystem.getMarkerIcon = function(iconID, visibility) {
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

MapSystem.removeMarker = function(id) {
	var marker = MapSystem.markers[id];
	if(marker) {
		MapSystem.map.removeLayer(marker.markerElement);
		delete MapSystem.markers[id];
	}
};

MapSystem.invokeRemoveMarker = function(marker, popup) {
	NET.removeMarker(marker.id, function() {
		MapSystem.map.removeLayer(popup);
		MapSystem.removeMarker(marker.id);
	});
};

MapSystem.ignoreMarker = function(marker, popup) {
	NET.ignoreMarker(marker.id, function() {
		MapSystem.map.removeLayer(popup);
		MapSystem.removeMarker(marker.id);
	});
};

MapSystem.displayMarker = function(marker) {
	var icon = MapSystem.getMarkerIcon(marker.icon, marker.visibility);
	var popup;
	//TODO: Edit marker
	var elem = $("<div></div>");
	elem.append($("<h1>" + marker.name + "</h1><p>" + marker.description + "</p>"));
	if(marker.author === Login.getUser().id) {
		elem.append($("<a href='#'>Remove</a>").click(function() {
			elem.html("<img src='img/loading.gif' />");
			MapSystem.invokeRemoveMarker(marker, popup);
		}));
	}
	else {
		elem.append($("<a href='#'>Ignore</a>").click(function() {
			elem.html("<img src='img/loading.gif' />");
			MapSystem.ignoreMarker(marker, popup);
		}));
	}
	popup = L.popup().setContent(elem[0]);
	var markerElement = L.marker([marker.lat, marker.lng], {
		icon : icon
	});
	markerElement.bindPopup(popup);
	markerElement.addTo(MapSystem.map);
	MapSystem.markers[marker.id] = marker;
	MapSystem.markers[marker.id].markerElement = markerElement;
};

MapSystem.displayMarkers = function(markers) {
	for(var i in markers) {
		var marker = markers[i];
		MapSystem.displayMarker(marker);
	}
};

MapSystem.displayCreateMarkerInterface = function(latlng) {
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
				MapSystem.map.removeLayer(popup);
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
		.openOn(MapSystem.map);
};
