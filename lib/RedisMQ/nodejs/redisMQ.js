/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const jsonfile = require('jsonfile');
const fs = require('fs');
const path = require('path');
const config = require('./lib/configMethods.js');
const proClient = require('./lib/client/producer.js');
const conClient = require('./lib/client/consumer.js');
const ValidationError = require('./lib/errors/ValidationError.js');
const configData = null;

/*
* Description:
* 	This function loads the configuration file and stores it in the variable configData in a synchronus way.
* Args:
* 	filePath (String): The path to the redisMQ cofigureation file
* Returns:
* 	N/A
* Throws:
*	ValidationError: (Error Obj): This custom error signifies there was an error when validating the configurations that was passed in.
*/
function init (filePath) {
	// Checks if the Argument passed in is a string
	if (typeof(filePath) != 'string') {
		throw new ValidationError('----ERROR: ' + filePath + ' was passed in and is not a file path string.');
	}
	if (fs.existsSync(filePath)) {
		var realFilePath = filePath;
	} else if (fs.existsSync(path.join(__dirname , filePath))) {
		var realFilePath = path.join(__dirname , filePath);
	} else {
		throw new ValidationError('----ERROR: Config file doesn\'t exist at the path:\n\t'+ filePath);
	}
	// Reads file at the file path passed in
	// Assigning the variable with the loaded JSON object 
	try {
		configData = config.check(jsonfile.readFileSync(realFilePath));
	} catch (err){
		throw err;
	}
}

function addProducer (logger, configKey){
	
	if (configData === null) {
		logger.error('RedisMQ client has not loaded its config file');
		process.exit(1);
	}

	if (!(configData.hasOwnProperty(configKey))) {
		logger.error('The Key: ' + configKey + ' is not in the loaded config file');
		process.exit(1);
	}

	try {
	} catch (err) {
		console.log('Failed to instantiate the producer. Details:\n\t' + err);
		process.exit(1);
	}
}

function addConsumer (logger, configKey){
	if (configData === null) {
		logger.error('RedisMQ client hs not loaded its config file');
		process.exit(1);
	}

	if (!(configData.hasOwnProperty(configKey))) {
		logger.error('The Key: ' + configKey + ' is not in the loaded config file');
		process.exit(1);
	}

	try {
	} catch (err) {
		console.log('Failed to instantiate the consumer. Details:\n\t' + err);
		process.exit(1);
	}
}

module.exports = {
	init: init,
	config: configData,
	addProducer: addProducer,
	addConsumer: addConsumer
} 
