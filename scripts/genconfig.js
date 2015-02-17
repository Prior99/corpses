var Prompt = require('prompt');
var FS = require('fs');

Prompt.message = "";
Prompt.delimiter = "";
Prompt.colors = false;

var schema = {
	properties: {
		websocketPort : {
			pattern : /\d+/,
			message : "Port must be a number!",
			description : "On which port should the websocketserver run? ",
			required : true,
			default : 4733
		},
		clientDirectory : {
			required : true,
			message : "Please enter a directory!",
			description : "Where did you put the directory of the webclient? ",
			default : "htdocs/"
		},
		mapDirectory : {
			required : true,
			description : "Where is the \"map/\" directory of your 7DTD's instance located?"
		},
		kickUnregistered : {
			pattern : /true|false/,
			message : "This must be either true or false.",
			description : "Should unregistered players get kicked? (true/false)",
			required : true,
			default : true
		},
		website : {
			message : "Please enter an URL!",
			description : "On what URL can the webclient reached from the world? ",
			required : true
		},
		telnetPort : {
			pattern : /\d+/,
			message : "Port must be a number!",
			description : "What port does the 7DTD server's telnetinterface listen on?  ",
			required : true,
			default : 8081
		},
		telnetHost : {
			required : true,
			message : "Please enter a host!",
			default : "localhost",
			description : "What host does the 7DTD server run on? "
		}
	}
};

var db = {
	properties : {
		host : {
			required : true,
			default : "localhost",
			message : "Please enter a host!",
			description : "What host does the database run on? "
		},
		user : {
			required : true,
			message : "Enter a valid username!",
			description : "Which user should be used to log in to the database? "
		},
		password : {
			required : false,
			description : "What password does the user use? "
		},
		database : {
			required : true,
			message : "Enter the name of a database!",
			description : "What is the name of the database to use? "
		}
	}
};


Prompt.start();

function startOver() {
	Prompt.get(schema, function(err, results) {
		Prompt.get(db, function(err, db) {
			results.database = db;
			console.log("This will be the content of your configfile:");
			var json = JSON.stringify(results, null, 4);
			console.log(json);
			Prompt.get({
					validator: /y[es]*|n[o]?/,
					required: true,
					default: "yes",
					warning: "Anwser 'yes' or 'no'!",
					message: "Is that okay?"
			}, function(err, okay) {
				if(okay) {
					FS.writeFile("server/config.json", json, function(err) {
						if(!err) {
							process.exit(0);
						}
						else {
							process.exit(1);
						}
					});
				}
				else {
					startOver();
				}
			});
		});
	});
};

Prompt.confirm("Do you want to generate a configfile interactivly? (yes/no)", function(err, okay) {
	if(okay) {
		startOver();
	}
	else {
		process.exit(1);
	}
});
