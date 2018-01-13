/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

'user strict';

const AggregatorError = require('./errors/initializationError.js');
const Utils = require('util');
const EventEmitter = require('events');
let cache = {}

/*
* Description:
*   This promise initializes the Filter module.
* Args:
*   logger (Logger): This is the logger that is provided by the logger from the consumer.
*   configJSON (Obj): This obj has the configurations for the Filter microservice.
* Returns:
*   Filter (FilterInstance): This FilterInstance has a validated configuration and a promise that can be
*     accessed asynchronously that filters messages based on those configurations.
* Throws:
*   FilterInitializationError (Error): This error is raised if any configurations are out of place when initializing the Filter module
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let initAggregator = (validConfig, logger) => {
  return new Promise(
    resolve => {
      if (validConfig['setup'] === 'internal') {
        if (validConfig['storage']['strategy'] === 'uniqueEvent') {
          cache = 
        } else {
          cache = 
        }
      } else if (validConfigp['setup'] === 'external') {
        logger.info('External is not apart of this current release.')
      } else {
        logger.error('There does not exist an option that is not either \'internal\' or \'external\'')
      }
    }
  )
}

/*
* Description:
*   This promise initializes the Filter module.
* Args:
*   redisMsg (redisMsg): This is a redisMsg that needs to be added to the cache
* Returns:
*   Filter (FilterInstance): This FilterInstance has a validated configuration and a promise that can be
*     accessed asynchronously that filters messages based on those configurations.
* Throws:
*   FilterInitializationError (Error): This error is raised if any configurations are out of place when initializing the Filter module
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
function addData (redisMsg) => {
  return new Promise(
    resolve => {
      
    }
  )
}
Utils.inherits(addData, EventEmitter)

/*
* Description:
*   This promise initializes the Filter module.
* Args:
*   logger (Logger): This is the logger that is provided by the logger from the consumer.
*   configJSON (Obj): This obj has the configurations for the Filter microservice.
* Returns:
*   Filter (FilterInstance): This FilterInstance has a validated configuration and a promise that can be
*     accessed asynchronously that filters messages based on those configurations.
* Throws:
*   FilterInitializationError (Error): This error is raised if any configurations are out of place when initializing the Filter module
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let customFlush = (payload, configJSON, logger) => {
  return new Promise(
    resolve => {
    }
  )
}

module.exports = {
  initFilter: initFilter,
  filterData: filterData
}
