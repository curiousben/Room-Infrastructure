/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

let FilterInitializationError = require('./errors/initializationError.js')
let FilterError = require('./errors/filterError.js')

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
        let typeOfMatch = filterConfig[key]['typeOfMatch']
        if (!('acceptedValues' in filterConfig[key]) || !('location' in filterConfig[key]) || !('typeOfMatch' in filterConfig[key])) {
          throw new FilterInitializationError('Filter configuration is missing either \'acceptedValues\', \'location\', or \'typeOfMatch\' for the filtered data ' + key)
        }
        if (typeOfMatch !== 'exactString' && typeOfMatch !== 'partial' && typeOfMatch !== 'exactNumber' && typeOfMatch !== 'greaterThan' && typeOfMatch !== 'lessThan') {
          throw new FilterInitializationError('The type of match configration for the key: ' + key + ' is not either \'exactString\', \'partial\', \'exactNumber\', \'greaterThan\', and \'lessThan\'.')
        }
        if (typeOfMatch === 'exactNumber' || typeOfMatch === 'greaterThan' || typeOfMatch === 'lessThan ') {
          let acceptedValues = filterConfig[key]['acceptedValues']
          if (acceptedValues.length !== 1) {
            throw new FilterInitializationError('Filter configuration for the accpeted values for the key: \'' + key + '\' greaterThan and lesserThan can only have one element in the array')
          }
          if (isNaN(acceptedValues[0])) {
            throw new FilterInitializationError('Filter configuration for the accepted values for the key: \'' + key + '\' is a string not a number')
          }
        }
      }
      filterConfig['keys'] = Object.keys(configJSON['data'])
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
*   From a design perspective if the key doesn't even exist it should have been filtered out further upstream in the first place as oppose to having it being filtered out in this microservice. So an error will be raised
* TODO:
*   [#1]:
*     Add the feature to allow multiple comparisons from multiple keys
*/
let filterData = (payload, configJSON, logger) => {
  return new Promise (
    resolve => {
      const config = configJSON
      let resultArray = []
      let errorArray = []
      let data = Object.assign({}, payload)
      //[#1]
      for (let filterKey in config) {
        let pathToKey = config[filterKey]['location'].slice(0)
        pathToKey.push(filterKey)
        let typeOfMatch = config[filterKey]['typeOfMatch']
        let acceptedValues = config[filterKey]['acceptedValues']
        for (let key in pathToKey) {
          data = data[pathToKey[key]]
          if (data === undefined) {
            throw new FilterError(pathToKey[key] + ' does not exist in the payload')
          }
        }
        switch (typeOfMatch) {
        case 'exactString':
          if (acceptedValues.indexOf(data) !== -1) {
            logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was an exact match to the string value \'' + acceptedValues[acceptedValues.indexOf(data)] + '\' from the accepted value(s) \'' + acceptedValues.join(', ') + '\'')
            resultArray.push(true)
          } else {
            errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was not an exact match to the accepted string value(s) \'' + acceptedValues.join(', ') + '\'')
            resultArray.push(false)
          }
          break
        case 'partial':
          for (let possibleValue in acceptedValues) {
            if (acceptedValues[possibleValue].indexOf(data) !== -1) {
              logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was an partial or exact match to the accepted value \'' + acceptedValues[possibleValue] + '\' from the accepted value(s) \'' + acceptedValues.join(', ') + '\'')
              resultArray.push(true)
              break
            }
            if (parseInt(possibleValue) === (acceptedValues.length - 1)) {
              errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location \'' + pathToKey.join(' -> ') + '\' was not an partial match to the accepted value(s) \'' + acceptedValues.join(', ') + '\'')
              resultArray.push(false)
            }
          }
          break
        case 'exactNumber':
          if (data === acceptedValues[0]) {
            logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was greater than the accepted number value \'' + acceptedValues[0] + '\'')
            resultArray.push(true)
          } else {
            errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was not greater than the accepted number value \'' + acceptedValues[0] + '\'')
            resultArray.push(false)
          }
          break
        case 'greaterThan':
          if (data > acceptedValues[0]) {
            logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was greater than the accepted value \'' + acceptedValues[0] + '\'')
            resultArray.push(true)
          } else {
            errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was not greater than the accepted value \'' + acceptedValues[0] + '\'')
            resultArray.push(false)
          }
          break
        case 'lessThan':
          if (data < acceptedValues[0]) {
            logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was an partial or exact match to the accepted value \'' + acceptedValues[0] + '\' from the accepted value(s) \'' + acceptedValues.join(', ') + '\'')
            resultArray.push(true)             
          } else {
            errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was not less than the accepted value \'' + acceptedValues[0] + '\'')
            resultArray.push(false)
          }
          break
        default:
          throw new FilterError('The \'typeOfMatch\' - \'' + typeOfMatch + '\' in the configuration for the filtering of the key \'' + filterKey + '\' has a misconfigured value')
        }
      }
      let finalResult = true
      resultArray.forEach(function(result) {
        finalResult = result && finalResult
      })
      resolve(finalResult)
    }
  )
}

module.exports = {
  initFilter: initFilter,
  filterData: filterData
}
