/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const winston = require('winston');
const jsonfile = require('jsonfile');

var loggerInit = function (filePath) {
	jsonfile.readFile(filePath, function(err, configData){
		if (err != null){
			console.error('Failed to instantiate the logger. Details:\n\t' + err);
			process.exit(1);
		}
		try {
			
			var loggerFilePath = configData.logFile;
			var logLevel = configData.logLevel;
			var consoleVisibility = String(configData.visibility.console);
			var fileVisibility = String(configData.visibility.file);
			var exitOnError= Boolean(configData.exitOnError);
		
			var logger = new (winston.logger)({
				levels: logLevel,
				transports: [
					new (winston.transports.Console)({
						level: consoleVisibility
					}),
					new (winston.transports.File)({
						filename: loggerFilePath,
						level: fileVisibility 
					})],
				exitOnError: exitOnError
			});
		} catch (err) {
			console.error('Failed to instantiate the logger Details:\n\t' + err);
			process.exit(1);
		}
		return logger;
	});
};

module.exports = loggerInit;
