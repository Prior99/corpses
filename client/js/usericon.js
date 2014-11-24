L.userIcon = L.Icon.extend({
	options: {
	    iconUrl: "img/marker-user.png",
	    iconSize: new L.Point(32, 32),
		iconAnchor: new L.Point(16, 16),
		popupAnchor: new L.Point(0, -33),
	},

	createIcon: function () {
		var div = $("<div class='usermarker'></div>");
		var img = this._createImg(this.options["iconUrl"]);
		var numdiv = $("<div></div>");
		numdiv.addClass("number");
		numdiv.html(this.options["number"]);
		div.append(img);
		div.append(numdiv);
		this.imgElem = $(img);
		this._setIconStyles(div[0], "icon");
		this.setRotation(this.options["rotation"]);
		return div[0];
	},

	setRotation : function(deg) {
		this.imgElem.css({"transform" : "rotate(" + deg + "deg)"})
	}
});
