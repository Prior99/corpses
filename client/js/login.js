var Login = {};

Login.restoreLoginData = function() {
	if(localStorage["login"] !== undefined) {
		Login.loginData = JSON.parse(localStorage["login"]);
	}
};

Login.storeLoginData = function(name, password) {
	Login.loginData = {
		name : name,
		password : password
	};
	localStorage["login"] = JSON.stringify(Login.loginData);
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
}

Login.deleteStoredLoginData = function() {
	localStorage["login"] = undefined;
}

Login.checkLogin = function(callback) {
	if(!Login.isLoginDataAvailable()) {
		Login.restoreLoginData();
	}
	if(!Login.isLoginDataAvailable()) {
		callback(false);
	}
	else {
		Websocket.send("login", {
				name: Login.loginData.name,
				password: Login.loginData.password
			},
			function(obj){
				if(!obj.okay) {
					Login.deleteStoredLoginData();
				}
				callback(obj.okay);
			}
		);
	}
};

Login.encrypt = function(key, msg){
	var encrypter = new jsSHA(msg, "TEXT");
	return encrypter.getHMAC(key, "TEXT", "SHA-256", "HEX");
};

Login.login = function(name, password, remember, callback){
	var passwdEnc = Login.encrypt(name, password);
	Websocket.send("login", {
			name: name,
			password: passwdEnc
		},
		function(obj){
			if(obj.okay == true && remember == true){
				Login.storeLoginData(name, passwdEnc);
			}
			callback(obj);
		}
	);
};

Login.register = function(name, password, steamID, remember, callback){
	var passwdEnc = Login.encrypt(name, password);
	Websocket.send("register", {
			name: name,
			password: passwdEnc,
			steamid: steamID
		},
		function(obj){
			if(obj.okay == true && remember == true){
				Login.storeLoginData(name, passwdEnc);
			}
			callback(obj);
		}
	);
};
