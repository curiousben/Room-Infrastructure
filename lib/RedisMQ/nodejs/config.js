/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */

'use strict'

/*
*
* Description:
*   This function checks a passed in config object for the expected RedisMQ configurations.
* Args:
*   configObj (Object): JSON object passed in from the redisMQ module.
* Returns:
*   configObj (Object): JSON object that has been checked for correct keys.
* TODO:
*   [#1]:
*     Need to add recursion for complete sanatation of possible null values in config file.
*/

function configCheck (configObj) {
  // TODO:[1#]
  // Checks to see if 'broker', 'producers', and 'consumer' are in the top level of the json object
  if (!('broker' in configObj && 'producers' in configObj && 'consumers' in configObj)) {
    console.error('----ERROR|RedisMQ|Config: Configfile is missing one or many of the primary configurations. The primary configurations are: \'broker\',\'producers\',\'consumers\'.')
    process.exit(1)
  }
  // Checks to see if 'host' and 'port' are in the broker section
  const broker = configObj['broker']
  if (!('host' in broker && 'port' in broker)) {
    console.error('----ERROR|RedisMQ|Config: Broker section of the config file is missing one or many of broker configurations. The broker configurations are: \'host\', \'port\'.')
    process.exit(1)
  }
  // Checks to see if 'topic' and 'ack' are in each individual producer's configuration in the producers section.
  const producers = configObj['producers']
  for (var proKey in producers) {
    if (!('topic' in producers[proKey] && 'ack' in producers[proKey])) {
      console.error('----ERROR|RedisMQ|Config: The ' + proKey + ' section of the producers section is missing one or many of the required producer configurations. The producer configurations are: \'topic\', \'ack\'.')
      process.exit(1)
    }
  }
  // Checks to see if 'topic', 'ack', and 'process.limit' are in each individual consumer's configuration in the consumers section.
  const consumers = configObj['consumers']
  for (var conKey in consumers) {
    if (!('topic' in consumers[conKey] && 'ack' in consumers[conKey] && 'process.limit' in consumers[conKey])) {
      console.error('----ERROR|RedisMQ|Config: The ' + conKey + ' section of the consumers section is missing one or many of the required consumer configurations. The consumer configurations are: \'topic\', \'ack\', \'process.limit\'.')
      process.exit(1)
    }
  }
  // Returns checked config object
  return configObj
}

module.exports = {
  configCheck: configCheck
}
