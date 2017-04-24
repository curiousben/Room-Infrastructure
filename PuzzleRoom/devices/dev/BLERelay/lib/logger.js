var winston = require('winston');
var fs = require('fs');
try {
		var configFile = __dirname + "../config/ble_relay.config";
		var configData = JSON.parse(fs.readFileSync(configFile, "utf8"));
		var loggerFilePath = String(assertDefined(configData.logfile));
		var loggerLevel = assertDefined(configData.logLevel);
		var consoleVisibility = String(assertDefined(configData.visibility.console));
		var fileVisibility = String(assertDefined(configData.visibility.file));
		var exitOnError= Boolean(assertDefined(configData.exitOnError));
		
} catch(ex) {
		console.log('Failed to instantiate the logger Details:\n\t' + ex);
		process.exit(1);
} 
var logger = new (winston.logger)({
		levels: logLevel
		transports: [
			new (winston.transports.Console)({
				level: consoleVisibility
			}),
			new (winston.transports.File)({
				filename: loggerFilePath,
				level: fileVisibility 
			})
		],
		exitOnError: exitOnError
})
modules.export = logger
