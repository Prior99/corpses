var config = require("../server/config.json");

var okay = true;

function check(key, config) {
	if(config[key] === undefined) {
		okay = false;
	}
}

check("websocketPort", config);
check("telnetPort", config);
check("telnetHost", config);
check("clientDirectory", config);
check("mapDirectory", config);
check("database", config);
check("kickUnregistered", config);
check("website", config);
if(typeof config.database === undefined) {
	check("host", config.database);
	check("user", config.database);
	check("password", config.database);
	check("database", config.database);
}

if(!okay) {
	process.exit(1);
}
else {
	process.exit(0);
}
