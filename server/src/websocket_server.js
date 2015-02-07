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
/**
 * This module is a wrapper around a websocket from the 'ws' library.
 * It implements a bidirectional event base protocol for client-server
 * communication. It is possible to fire events with arguments that will
 * be transmitted to the remote end as well as listening for events and answering
 * them respectivly.
 * This wraps around an already initialized websocket.
 * @constructor
 * @param {object} socket - The websocket to wrap around.
 */
var Websocket = function(socket){
	this.listeners = {};
	this.closeListeners = [];
	this.responses = {};
	this.id = 0;
	this.dead = false;
	this.socket = socket;
	var self = this;
	this.socket.on("message", function(message){
		self._receive(message);
	});
	this.socket.on("close", function(){
		this.dead = true;
		for(var i in self.closeListeners) {
			self.closeListeners[i]();
		}
	});
};
/**
 * Will be called once the connection was closed.
 * @callback Websocket~closeCallback
 */
/**
 * Can be called to answer to a listener.
 * @callback Websocket~async
 * @param {*} answer - The answer to send back.
 */
/**
 * Will be called once the event this listener was added for occured.
 * @param {*} obj - Any data sent by the event
 * @param {Websocket~async} [async] - If this is specified, the listener will
 *									  be asynchroneous which means that not the
 * 									  return value of the method will be sent as
 *									  answer but this callback mus be called with
 *									  the answer to send.
 * @callback Websocket~listener
 */
/**
 * Append a closelistener to this wrapper that will be called when the socket
 * was closed. This could happen when either the remote or the local end abort
 * the connection.
 * @param {Websocket~closeCallback} func - Called when the socket was closed.
 */
Websocket.prototype.addCloseListener = function(func) {
	this.closeListeners.push(func);
};

/**
 * Listen for a certain event and answer to it. Please note that there is only
 * one listener allowed per event.
 * @param {string} key - The name of the event to listen to.
 * @param {Websocket~listener} listener - Will be called once the event was received.
 */
Websocket.prototype.addListener = function(key, listener){
	this.listeners[key] = listener;
};

/**
 * Alias for {@link Websocket#addListener}.
 */
Websocket.prototype.on = Websocket.prototype.addListener;

/**
 * Will remove the listener for the respective event.
 * @param {string} key - The listener to remove.
 */
Websocket.prototype.removeListener = function(key) {
	delete this.listeners[key];
};
/**
 * Will be called once the remote end answers to the event.
 * @callback Websocket~answerListener
 * @param {*} answer - The answer sent by the remote end. Can be anything
 */
/**
 * Send an event. This will fire the event on the remote site and may eventually
 * call the callback if the remote site answers.
 * @param {string} key - The name of the event to fire
 * @param {*} param - Data to send with this event. Can be anything
 * @param {Websocket~answerListener} handler - Listener to call once the remote
 *											   end answered.
 */
Websocket.prototype.send = function(key, param, handler){
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

Websocket.prototype._receive = function(message){
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
			if(listener.length === 2){
				listener(obj.param, function(ans){
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
				var ans = listener(obj.param);
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

module.exports = Websocket;
