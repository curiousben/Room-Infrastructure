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

const ValidationError = require('./errors/validationError.js')

function check (configObj) {
  // TODO:[1#]
  // Checks to see if 'broker', 'producers', and 'consumer' are in the top level of the json object
  if (!('broker' in configObj && 'producers' in configObj && 'consumers' in configObj)) {
    throw new ValidationError('----ERROR: Configfile is missing one or many of the primary configurations. The primary configurations are: \'broker\',\'producers\',\'consumers\'.')
  }
  // Checks to see if 'host' and 'port' are in the broker section
  const broker = configObj['broker']
  if (!('host' in broker && 'port' in broker)) {
    throw new ValidationError('----ERROR: Broker section of the config file is missing one or many of broker configurations. The broker configurations are: \'host\', \'port\'.')
  }
  // Checks to see if 'topic' and 'ack' are in each individual producer's configuration in the producers section.
  const producers = configObj['producers']
  for (var proKey in producers) {
    if (!('topic' in producers[proKey] && 'ack' in producers[proKey])) {
      throw new ValidationError('----ERROR: The \'' + proKey + '\' section of the producers section is missing one or many of the required producer configurations. The producer configurations are: \'topic\', \'ack\'.')
    }
  }
  // Checks to see if 'topic', 'ack', and 'process.limit' are in each individual consumer's configuration in the consumers section.
  const consumers = configObj['consumers']
  for (var conKey in consumers) {
    if (!('topic' in consumers[conKey] && 'ack' in consumers[conKey] && 'process.limit' in consumers[conKey])) {
      throw new ValidationError('----ERROR: The \'' + conKey + '\' section of the consumers section is missing one or many of the required consumer configurations. The consumer configurations are: \'topic\', \'ack\', \'process.limit\'.')
    }
  }
  // Returns checked config object
  return configObj
}

module.exports = {
  check: check
}
