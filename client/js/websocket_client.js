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

/**
 * websocket.js
 *
 * Handles the connection between the browser and the server on top
 * of the websocket-protocol.
 *
 * Distributed 2014 by Soana (Andra Ruebsteck) under the terms of GPL.
 * Based upon an original idea by Prior (Frederick Gnodtke).
 */
var Websocket = {
	openListener: [],
	errorListener: [],
	closeListener: [],
	messageListener: {},
	responses: {},
	init: function(){
		this.id = 0;

		this.socket = new WebSocket("ws://"+ location.hostname + ":" + _port + "/");
		var self = this;
		this.socket.onmessage = function(evt){
			self.onMessage(evt);
		};
		this.socket.onopen = function(evt){
			self.onOpen(evt);
		};
		this.socket.onclose = function(evt){
			self.onClose(evt);
		};
		this.socket.onerror = function(evt){
			self.onError(evt);
		};

	},

	onMessage: function(evt){
		var self = this;
		var obj = JSON.parse(evt.data);
		console.log("received: " + evt.data);
		if(obj.type === undefined || obj.id === undefined){
			console.error("received broken packet: " + evt.data + " - Required field missing");
			return;
		}

		if(obj.type === "req" && obj.key !== undefined ){
			var listener = this.messageListener[obj.key];
			if(listener !== undefined){
				if(listener.async){
					listener.listener(obj.param, function(ans){
						var answer = {
							id: obj.id,
							type: "res",
							param: ans
						};
						self.socket.send(JSON.stringify(answer));
					});
				}
				else{
					var ans = listener.listener(obj.param);
					var answer = {
						id: obj.id,
						type: "res",
						param: ans
					};
					this.socket.send(JSON.stringify(answer));
				}
			}
		}
		else if(obj.type === "res"){
			var handler = this.responses[obj.id];
			if(handler !== undefined){
				handler(obj.param);
				this.responses[obj.id] = undefined;
			}
		}
		else{
			console.error("received broken packet: " + message + " - Invalid type");
			return;
		}
	},

	onOpen: function(evt){
		for(var l in this.openListener){
			this.openListener[l](evt);
		}
	},

	onClose: function(evt){
		for(var l in this.closeListener){
			this.closeListener[l](evt);
		}
	},

	onError: function(evt){
		for(var l in this.errorListener){
			this.errorListener[l](evt);
		}
	},

	addOpenListener: function(listener){
		this.openListener.push(listener);
	},

	addErrorListener: function(listener){
		this.errorListener.push(listener);
	},

	addCloseListener: function(listener){
		this.closeListener.push(listener);
	},

	addMessageListener: function(key, listener, async){
		this.messageListener[key] = {
			listener: listener,
			async: async === true
		};
	},
	send: function(key, param, handler){
		var meta = {
			param: param,
			key: key,
			type: "req",
			id: this.id
		};
		this.responses[this.id] = handler;
		console.log("send: " + JSON.stringify(meta));
		this.socket.send(JSON.stringify(meta));
		this.id++;
	}
};

$(function(){
	if(window.WebSocket){
		Websocket.init();
	}
	else{
		console.err("This browser does not support WebSockets!");
	}
});
