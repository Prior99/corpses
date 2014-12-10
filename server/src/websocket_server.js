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
var Winston = require('winston');

var Connection = function(socket){
	this.listeners = {};
	this.closeListeners = [];
	this.responses = {};
	this.id = 0;
	this.dead = false;
	this.socket = socket;
	var self = this;
	this.socket.on("message", function(message){
		self.receive(message);
	});
	this.socket.on("close", function(){
		this.dead = true;
		for(var i in self.closeListeners) {
			self.closeListeners[i]();
		}
	});
};

Connection.prototype.addCloseListener = function(func) {
	this.closeListeners.push(func);
};

Connection.prototype.addListener = function(key, listener){
	this.listeners[key] = {
		listener: listener
	};
};

Connection.prototype.on = Connection.prototype.addListener;

Connection.prototype.removeListener = function(key) {
	delete this.listeners[key];
};

Connection.prototype.send = function(key, param, handler){
	var meta = {
		param: param,
		key: key,
		type: "req",
		id: this.id
	};
	this.responses[this.id] = handler;
	if(!this.dead) {
		this.socket.send(JSON.stringify(meta));
	}
	this.id++;
};

Connection.prototype.receive = function(message){
	var self = this;
	var obj;
	try {
		obj = JSON.parse(message);
	}
	catch(e) {
		Winston.error("received broken packet");
		return;
	}
	if(obj.type === undefined || obj.id === undefined){
		Winston.error("received broken packet: " + message + " - Required field missing");
		return;
	}

	if(obj.type === "req" && obj.key !== undefined ){
		var listener = this.listeners[obj.key];
		if(listener !== undefined){
			if(listener.listener.length === 2){
				listener.listener(obj.param, function(ans){
					var answer = {
						id: obj.id,
						type: "res",
						param: ans
					};
					if(!self.dead) {
						self.socket.send(JSON.stringify(answer));
					}
				});
			}
			else{
				var ans = listener.listener(obj.param);
				var answer = {
					id: obj.id,
					type: "res",
					param: ans
				};
				if(!self.dead) {
					this.socket.send(JSON.stringify(answer));
				}
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
		Winston.error("received broken packet: " + message + " - Invalid type");
		return;
	}
};

module.exports = Connection;
