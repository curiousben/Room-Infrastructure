/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const redis = require('redis');
const jsonfile = require('jsonfile');
const fs = require('fs');
const uuid = require('uuid');
var configData = null;


/*
* Description:
* 	This function loads the configuration file and stores it in the variable configData
* Args:
* 	filePath (String): The path to the redisMQ cofigureation file
* Returns:
* 	N/A
*/
function init (filePath) {
	// Checks if the Argument passed in is a string
	if (typeof(filePath) == "string" && fs.existsSync(filePath)){
		// Reads file at the file path passed in
		jsonfile.readFile(filePath, function(err, fileobj){
			if (err != null){
				console.error('Failed to load the config file for the producer. Details:\n\t' + err);
				process.exit(1);
			}
			// Assigning the variable with the loaded JSON object 
			configData = fileobj;
		});
	} else {
		console.error("Config file doesn't exist at the path:\n\t"+ filePath);
		process.exit(1);
	}
};

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
