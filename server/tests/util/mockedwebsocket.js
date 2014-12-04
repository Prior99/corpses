Webs = function() {
	this.listeners = [];
	this.listenerMap = {};
};

Webs.prototype.addListener = function(key, callback, async) {
	this.listeners.push(key);
	this.listenerMap[key] = {
		callback : callback,
		async : async
	};
};

Webs.prototype.send = function(key, data, callback) {
	this.lastMsg = {
		key : key,
		data : data,
		callback : callback
	}
};

Webs.prototype.addOpenListener = function(callback) {

};

Webs.prototype.addCloseListener = function(callback) {

};

Webs.prototype.callMockedListener = function(name, data, callback) {
	var l = this.listenerMap[name];
	if(l.async) {
		l.callback(data, callback);
	}
	else {
		callback(l.callback(data));
	}
};

module.exports = Webs;
