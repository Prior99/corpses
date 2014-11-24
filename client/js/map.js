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
	markerIcons : {},
	markers : {},
};

Map.init = function() {
	$.getJSON("map/mapinfo.json", function(json) {
		Map.initLeaflet(json);
		Websocket.send("fetchMarkers", {}, function(obj) {
			if(obj.okay) {
				Map.displayMarkers(obj.markers);
			}
			else {
				//TODO Error handling
			}
		});
	});
	Websocket.addMessageListener("marker", function(obj) {
		Map.displayMarker(obj);
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
		zoomControl: true,
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

Map.getMarkerIcon = function(iconID) {
	var icon;
	if(!(icon = Map.markerIcons[iconID])) {
		icon = L.AwesomeMarkers.icon({
			icon : iconID,
			prefix: 'fa',
			markerColor : "blue" //TODO: Change color depending on marker type (private, public, etc.) here
		});
		Map.markerIcons[iconID] = icon;
	}
	return icon;
}

Map.removeMarker = function(marker, popup) {
	NET.removeMarker(marker.id, function() {
		Map.map.removeLayer(popup);
	});
};

Map.ignoreMarker = function(marker, popup) {
	NET.ignoreMarker(marker.id, function() {
		Map.map.removeLayer(popup);
	});
};

Map.displayMarker = function(marker) {
	var icon = Map.getMarkerIcon(marker.icon);
	var popup;
	//TODO: Change content of popup depended of marker ownerage
	var elem = $("<div></div>")
	elem.append($("<h1>" + marker.name + "</h1><p>" + marker.description + "</p>"));
	if(marker.author === Login.getUser().id) {
		elem.append($("<a href='#'>Remove</a>").click(function() {
			elem.html("<img src='img/loading.gif' />");
			Map.removeMarker(marker, popup);
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
