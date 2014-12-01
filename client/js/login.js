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

var Login = {};

Login.getUser = function() {
	return Login.userData;
};

Login.restoreLoginData = function() {
	if(localStorage.login !== undefined) {
		Login.loginData = JSON.parse(localStorage.login);

		if(localStorage.logged_in !== undefined) {
			Login.loggedIn = JSON.parse(localStorage.logged_in);
		}
		else{
			Login.loggedIn = false;
		}
	}
};

Login.storeLoginData = function(name, password, remember) {
	Login.loginData = {
		name : name,
		password : password,
		remember: remember
	};
	localStorage.login = JSON.stringify(Login.loginData);
	localStorage.logged_in = true;
};

Login.retreiveLoginData = function() {
	if(!Login.isLoginDataAvailable()) {
		Login.restoreLoginData();
	}
	return Login.loginData;
};

Login.isLoginDataAvailable = function() {
	if(Login.loginData !== undefined) {
		return true;
	}
	else {
		return false;
	}
};

Login.logout = function(forever) {
	if(forever || Login.loginData.remember === false){
		Login.deleteStoredLoginData();
	}
	else{
		localStorage.logged_in = false;
	}
	window.location.href = "index.html";

};

Login.deleteStoredLoginData = function() {
	delete localStorage.login;
	delete localStorage.logged_in;
};

Login.checkLogin = function(callback) {
	if(!Login.isLoginDataAvailable()) {
		Login.restoreLoginData();
	}
	if(!Login.isLoginDataAvailable()) {
		callback(false);
	}
	else if(Login.loginData.remember === true || Login.loggedIn === true){
		Websocket.send("login", {
				name: Login.loginData.name,
				password: Login.loginData.password
			},
			function(obj){
				if(!obj.okay) {
					Login.deleteStoredLoginData();
				}
				Websocket.send("getUserData", {}, function(obj) {
					//TODO: Check Error
					Login.userData = obj.user;
					callback(obj.okay);
				});
			}
		);
	}
	else{
		Login.deleteStoredLoginData();
		callback(false);
	}
};

Login.encrypt = function(key, msg){
	var encrypter = new jsSHA(msg, "TEXT");
	return encrypter.getHMAC(key, "TEXT", "SHA-256", "HEX");
};

Login.login = function(name, password, remember, onErr){
	var passwdEnc = Login.encrypt(name, password);
	Websocket.send("login", {
			name: name,
			password: passwdEnc
		},
		function(obj){
			if(obj.okay === true){
				Login.storeLoginData(name, passwdEnc, remember);
				window.location.href = "map.html";
			}
			else{
				if(onErr) {
					onErr(obj.reason);
				}
				else {
					window.location.href = "index.html";
				}
			}
		}
	);
};

Login.register = function(name, password, steamID, remember, onErr){
	var passwdEnc = Login.encrypt(name, password);
	Websocket.send("register", {
			name: name,
			password: passwdEnc,
			steamid: steamID
		},
		function(obj){
			if(obj.okay === true){
				Login.storeLoginData(name, passwdEnc, remember);
				window.location.href = "map.html";
			}
			else{
				if(onErr) {
					onErr(obj.reason);
				}
				else {
					window.location.href = "index.html";
				}
			}
		}
	);
};
