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

Errors = {
	"internal_error" : {
		name : "Internal server error",
		description : "An internal server error occured. Please contact the system administrator about this incident and provide him with steps about how to reproduce this problem. To continue, try reloading the page, deleting all cookies and the browser cache and logging off and on again."
	},
	"no_login" : {
		name : "Not logged in",
		description : "You attempted to access commands that are only available if you are logged in. Please reevaluate that you are logged in and do not try to run commands manually."
	},
	"user_unknown" : {
		name : "User unknown",
		description : "The user you are specifying does not exist or is at least not known to the server."
	},
	"invalid_arguments" : {
		name : "Invalid input",
		description : "The input you supplied was invalid. Please check that all necessary fields are filled and the provided data is correct."
	},
	"username_taken_or_internal_error" : {
		name : "Username taken",
		description : "The username you chose was already taken. Please choose another username."
	},
	"username_or_password_wrong" : {
		name : "Username and password don't match or account is disabled",
		description : "The username and password you provided did not match any user in the database. Please check that both are correct. <i>Please note, that your account needs to be activated after it was registered or you were deactivated!</i>"
	},
	"no_admin" : {
		name : "Not an admin",
		description : "You tried to invoke a command that is for admins only."
	},
	"unknown_marker" : {
		name : "Unknown marker",
		description : "You supplied a marker that does not exist."
	}
};



Errors.displayError = function(errorcode) {
	var error = Errors[errorcode];
	//TODO: Display the error more fancy
	alert(error.name + "\r\n\r\n" + error.description);
};
