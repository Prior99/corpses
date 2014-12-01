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

L.userIcon = L.Icon.extend({
	options: {
	    iconUrl: "img/marker-user.png",
	    iconSize: new L.Point(32, 32),
		iconAnchor: new L.Point(16, 16),
		popupAnchor: new L.Point(0, -33),
	},

	createIcon: function () {
		var div = $("<div class='usermarker'></div>");
		var img = this._createImg(this.options.iconUrl);
		var numdiv = $("<div></div>");
		numdiv.addClass("number");
		numdiv.html(this.options.number);
		div.append(numdiv);
		div.append(img);
		this.imgElem = $(img);
		this._setIconStyles(div[0], "icon");
		this.setRotation(this.options.rotation);
		return div[0];
	},

	setRotation : function(deg) {
		this.imgElem.css({"transform" : "rotate(" + deg + "deg)"});
	}
});
