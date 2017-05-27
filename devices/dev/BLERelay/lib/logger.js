/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
'use strict';

const winston = require('winston');
const jsonfile = require('jsonfile');
const fs = require('fs');

/*
* Description:
* 	This function creates a winston logger and passes back a logger instance.
* Agruments:
*	filePath (String): An absolute path that has the logger config file.
* Return:
*	logger (Winston Logger Instance): A logger instnace with the configuration that was passed in fromthe configuration file
*/

function init(filePath) {
	if (!(fs.existsSync(filePath))){
		console.error('Failed to instantiate logger. Details:\n\tThe configuration file doesn\'t exist at the location: \''+filePath+'\'.');
		process.exit(1);
	}
	jsonfile.readFile(filePath, function(err, configData){
		if (err != null){
			console.error('Failed to instantiate logger. Details:\n\t' + err);
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
			console.error('Failed to instantiate logger. Details:\n\t' + err);
			process.exit(1);
		}
		return logger;
	});
}
module.exports = {
	init: init
};
