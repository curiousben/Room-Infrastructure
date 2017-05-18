/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

'use strict';

function configCheck (configObj) {
	//TODO: Need to check object and sub objects to see if the object is empty
	if (!(('broker' || 'producers' || 'consumers') in configObj)) {
		console.error('Configfile is missing one or many of the primary configurations. The primary configurations are: \'broker\',\'producers\',\'consumers\'');
		process.exit(1);
	}
	const broker = configObj['broker'];
	if (!(('host' || 'port') in broker)) {
		console.error('Broker section of the config file is missing one or many of broker configurations. The broker configurations are: \'host\', \'port\'');
		process.exit(1);
	}
	const producers = configObj['producers'];
	for (var key in producers) {
		if (!(('topic' || 'ack') in producers[key]) {
			console.error('The: ' + key + 'section of the producers section is missing one or many of the required producer configurations. The producer configurations are: \'topic\', \'ack\'');
			process.exit(1);
		}
	}
	return configObj; 
}

module.exports = {
	configCheck:configCheck 	
} 
