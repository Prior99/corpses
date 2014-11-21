function storeLoginData(remember, name, password){
	if(remember){
		localStorage["name"] =  name;
		localStorage["password"] =  password;
	}
}

function retreiveLoginData(){
	if(localStorage["name"] !== undefined && localStorage["password"] !== undefined){
		return {
			name: localStorage["name"],
			password: localStorage["password"]
		};
	}
	else {
		return undefined;
	}
}
