const winston = require('winston');
const jsonfile = require('jsonfile');

var loggerInit = function (filePath) {
	jsonfile.readFile(filePath, function(err, configData){
		if (err != null){
			console.log('Failed to instantiate the logger. Details:\n\t' + err);
			return;
		}
		try {
			
			var logLevel = assertDefined(configData.logLevel);
			var consoleVisibility = String(assertDefined(configData.visibility.console));
			var fileVisibility = String(assertDefined(configData.visibility.file));
			var exitOnError= Boolean(assertDefined(configData.exitOnError));
		
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
		} catch (err) {
			console.log('Failed to instantiate the logger Details:\n\t' + err);
			return;
		}
		return logger;
	})
}

module.exports = loggerInit;
