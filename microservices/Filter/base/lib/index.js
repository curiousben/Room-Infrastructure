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
        if (!(filterConfig[key]['typeOfMatch'] === "exact") && !(filterConfig[key]['typeOfMatch'] === "partial")) {
          throw new FilterInitializationError('The type of match configration for the key: ' + key + ' is not either \'exact\' or \'partial\'.')
        }
      }
      filterConfig['keys'] = Object.keys(configJSON['data'])
      logger.info('Filter module has been configured.')
      resolve(filterConfig)
    }
  )
}

/*
* Description:
*   This promise performs the actual filtering for every key in the Filter microservice configuration.
* Args:
*   payload (Obj): This obj is the payload passed to the filter to be filtered.
*   configJSON (Obj): This obj has the configurations for the Filter microservice.
*   logger (Logger): This is the logger that is provided by the consumer.
* Returns:
*   shouldBeFiltered (Boolean): This Boolean determines whether the message should be filtered or not. It is assumed that it should be filtered
* Throws:
*   FilterError (Error): This error is raised if the key does not exist in the payload in the first place.
* Notes:
*   From a design perspective if the key doesn't even exist it should have been filtered out further upstream in the first place as oppose to having it fail in this microservice.
* TODO:
*   [#1]:
*/
let filter = (payload, configJSON, logger) => {
  return new Promise (
    resolve => {
      let shouldBeFiltered = true
      logger.debug('Payload recieved:\n' + JSON.stringify(configJSON, null, 2))
      let data = payload
      for (key in configJSON) {
        let location_ = configJSON[key]['location'].push(key)
        let typeOfMatch = configJSON[key]['typeOfMatch']
        let acceptedValues = configJSON[key]['acceptedValues']
        for (key in location_) {
          data = data[location_[key]]
          if (data === undefined) {
            throw new FilterError(location_[key] + " does not exist in the payload")
          }
        }
        if (typeOfMatch === 'exact') {
          if (acceptedValues.indexOf(data) !== -1) {
            logger.debug('The value ' + data + ' that was encountered for the key ' + key + ' was an exact match to the value ' + acceptedValues[acceptedValues.indexOf(data)])
            resolve(shouldBeFiltered)
          } else {
            logger.debug('The value ' + data + ' that was encountered for the key ' + key + ' was not an exact match to one of the accepted values.')
            shouldBeFiltered = false
            resolve(shouldBeFiltered)
          }
        } else {
          for (possibleValue in acceptedValues) {
            if (possibleValue.indexOf(data) !== -1) {
              logger.debug('The value ' + data + ' that was encountered for the key ' + key + ' was an partial match to the accepted value ' + possibleValue)
              resolve(shouldBeFiltered)
            } else {
              logger.debug('The value ' + data + ' that was encountered for the key ' + key + ' was an partial match to the accepted value ' + possibleValue)
              shouldBeFiltered = false
              resolve(shouldBeFiltered)
            }
          }
        }
      }
    }
  )
}

module.exports = {
  initFilter: initFilter,
  filter: filter
}
