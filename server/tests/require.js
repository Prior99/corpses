var Winston = require('winston');
Winston.remove(Winston.transports.Console);

require("../src/server.js");
