/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

let FilterInitializationError = require('./errors/initializationError.js')
let JSONFilter = require('./methods/jsonFilter.js')

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
let initFilter = (configJSON) => {
  return new Promise(
    resolve => {
      let filterConfig = configJSON['data']
      for (let key in filterConfig) {

        // Checking the surface level configuration for existence and they are the arrays
        if (!('acceptedValues' in filterConfig[key]) || !('location' in filterConfig[key]) || !('typeOfMatch' in filterConfig[key]) || !('throwsError' in filterConfig[key])) {
          throw new FilterInitializationError('Filter configuration is missing either \'acceptedValues\', \'location\', \'typeOfMatch\', or \'throwsError\' for the filtered data ' + key + '.')
        }
        let acceptedValues = filterConfig[key]['acceptedValues']
        if (typeof acceptedValues !== 'object' || acceptedValues.constructor !== Array) {
          throw new FilterInitializationError('Filter configuration has encountered \'[' + acceptedValues.join(', ') + ']\' for the acceptedValues for the key: \'' + key + '\'. AcceptedValues can only be an Array.')
        }
        let locationOfData = filterConfig[key]['location']
        if (typeof locationOfData !== 'object' || locationOfData.constructor !== Array) {
          throw new FilterInitializationError('Filter configuration has encountered \'[' + locationOfData.join(', ') + ']\' for the locationOfData for the key: \'' + key + '\'. LocationOfData can only be an Array.')
        }
        let typeOfMatch = filterConfig[key]['typeOfMatch']
        if (typeof typeOfMatch !== 'string' && !(typeOfMatch instanceof String)) {
          throw new FilterInitializationError('Filter configuration has encountered \'[' + typeOfMatch.join(', ') + ']\' for the typeOfMatch for the key: \'' + key + '\'. TypeOfMatch can only be a String.')
        }
        let throwsError = filterConfig[key]['throwsError']
        if (typeof throwsError !== 'boolean') {
          throw new FilterInitializationError('Filter configuration has encountered \'' + throwsError + '\' for the throwsError for the key: \'' + key + '\'. ThrowsError can only be a Boolean.')
        }

        // Checking that the typeOfMatch has expected values
        if (typeOfMatch !== 'exactString' && typeOfMatch !== 'partial' && typeOfMatch !== 'exactNumber' && typeOfMatch !== 'greaterThan' && typeOfMatch !== 'lessThan') {
          throw new FilterInitializationError('The type of match configration for the key: ' + key + ' is not either \'exactString\', \'partial\', \'exactNumber\', \'greaterThan\', and \'lessThan\'.')
        }

        // Checking the accepted values to see if the values entered are expected
        if (typeOfMatch === 'exactNumber' || typeOfMatch === 'greaterThan' || typeOfMatch === 'lessThan') {
          if (acceptedValues.length !== 1) {
            throw new FilterInitializationError('Filter configuration has encountered \'[' + acceptedValues + ']\' for the accpeted values for the key: \'' + key + '\' greaterThan ,lesserThan, and exactNumbr can only have one element in the array')
          }
          if (isNaN(acceptedValues[0]) || acceptedValues[0] === '') {
            throw new FilterInitializationError('Filter configuration has encountered \'[' + acceptedValues + ']\' for the accepted values for the key: \'' + key + '\' is a string not a number')
          }
        }
        if (typeOfMatch === 'exactString' || typeOfMatch === 'partial') {
          for (let key in acceptedValues) {
            if (!isNaN(acceptedValues[key])) {
              throw new FilterInitializationError('Filter configuration has encountered \'' + acceptedValues[key] + '\' in the accepted values:  \'[' + acceptedValues.join(', ') + ']\' which is a number and not a string')
            }
          }
        }

        // Checking the location array has expected values
        for (let key in locationOfData) {
          if (typeof locationOfData[key] !== 'string' && !(locationOfData[key] instanceof String)) {
            throw new FilterInitializationError('Filter configuration has encountered \'' + locationOfData[key] + '\' in the location array: \'[' + locationOfData.join(', ') + ']\' which is a number and not a string')
          }
        }
      }
      resolve(filterConfig)
    }
  )
}
let filterData = (payload, configJSON, logger) => {
  return new Promise(
    resolve => {
      // Checking if payload is JSON
      if (typeof payload === 'object' && payload.constructor === Object) {
        resolve(JSONFilter.filterData(payload, configJSON, logger))
      }
      // .
      // .
      // .
      // Can add more data types for filtering
    }
  )
}

module.exports = {
  initFilter: initFilter,
  filterData: filterData
}
