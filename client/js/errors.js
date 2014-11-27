Errors = {
	"internal_error" : {
		name : "Internal server error",
		description : "An internal server error occured. Please contact the system administrator about this incident. And provide him steps about how to reproduce this problem. To continue, try reloading the page, refreshing your login and deleting all cookies and browsercache."
	},
	"no_login" : {
		name : "Not logged in",
		description : "You attempted to access commands that are only available if you are logged in. Please reevaluate that you are logged in and do not try to run commands manually."
	},
	"user_unknown" : {
		name : "User unknown",
		description : "The user you are specifying does not exist or is at least not known by the server."
	},
	"invalid_arguments" : {
		name : "Invalid input",
		description : "The input you supplied was invalid. Please check that all neccessary fields are filled and the provided data is correct."
	},
	"username_taken_or_internal_error" : {
		name : "Username taken",
		description : "The username you chose was already taken. Please choose another username."
	},
	"username_or_password_wrong" : {
		name : "Username and password don't match",
		description : "The username and password you provided did not match any user in the database. Please check, that both are correct."
	}
};



Errors.displayError = function(errorcode) {
	var error = Errors[errorcode];
	//TODO: Display the error more fancy
	alert(error.name + "\r\n\r\n" + error.description);
};
