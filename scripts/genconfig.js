var Prompt = require('prompt');

Prompt.message = "";
Prompt.delimiter = "";

var websocket = {
	properties: {
		websocketPort : {
			pattern : /\d+/,
			massage : "Port must be a number",
			description : "On which port should the websocketserver run? ".white,
			required : true,
			default : 4733,
		},
		clientDirectory : {
			required : true,
			description : "Where did you put the directory of the webclient? ".white,
			default : "htdocs/"
		},
		mapDirectory : {
			required : true,
			description : "Where is the \"map/\" directory of your 7DTD's instance located?".white,
		},
		kickUnregistered : {
			pattern : /true|false/,
			massage : "This must be either true or false.",
			description : "Should unregistered players get kicked? (true/false)".white,
			required : true,
			default : true,
		},
		website : {
			description : "On what URL can the webclient reached from the world? ".white,
			required : true
		},
		telnetPort : {
			pattern : /\d+/,
			massage : "Port must be a number",
			description : "What port does the 7DTD server's telnetinterface listen on?  ".white,
			required : true,
			default : 8081,
		},
		telnetHost : {
			required : true,
			default : "localhost",
			description : "What host does the 7DTD server run on? ".white,
		}
	}
};


Prompt.start();

Prompt.get(schema, function(err, results) {
	console.log(results);
});
