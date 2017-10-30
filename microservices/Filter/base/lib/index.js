/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/

let initErrors = require('./errors/filterError.js')
let filterErrors = require('./errors/initializationError.js')

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
let initFilter = (configJSON, logger) => {
  return new Promise(
    resolve => {
      logger.debug('Filter module received the following configuration:\n' + JSON.stringify(configJSON, null, 2))
      let filterConfig = configJSON['data']
      for (key in filterConfig) {
        if (!("acceptedValues" in filterConfig[key]) || !("location" in filterConfig[key]) || !("typeOfMatch" in filterConfig[key])) {
          throw new FilterInitializationError('Filter configuration is missing either \'acceptedValues\', \'location\', or \'typeOfMatch\' for the filtered data ' + key)
        }
      }
      logger.info('Filter module has been configured.')
      resolve(filterConfig)
    }
  )
}

module.exports = {
  initFilter: initFilter 
}

var location_ = ['one','two','three']
var payload = {"one":{"two":{"three":"DATA!"}}}
var data = payload
for (key in location_) {
  data = data[location_[key]]
  if (data === undefined) {
    throw new Error(location_[key] + " does not exist in the payload")
  }
}
console.log(data)
console.log(JSON.stringify(payload, null, 2))

