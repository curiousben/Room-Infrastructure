'user strict'

/*
*
*
*
*
*/

// 'Private' class methods
const 

// 'Private' class variables
const 

class Filter {

  constructor() {
    this[_isJSONObjFiltered] = true
    
  }

  async [_exactStringMatch] (data, acceptedValues) {
    if (acceptedValues.indexOf(data) !== -1) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  async [_partialMatch] (data, acceptedValues) {
    for (const possibleValue in acceptedValues) {
      if (acceptedValues[possibleValue].indexOf(data) !== -1) {
        resolve(true)
      }
    }
    resolve(false)
  }

  async [_exactNumberMatch] (data, acceptedValues) {
    if (Number(data) === Number(acceptedValues[0])) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  async [_greaterThanMatch] (data, acceptedValues) {
    if (Number(data) > Number(acceptedValues[0])) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  async [_lessThanMatch] (data, acceptedValues) {
    if (Number(data) < Number(acceptedValues[0])) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  async processPayload() {

    let data = arguments[0]
    let pathToKey = arguments[1]
    let typeOfMatch = arguments[2]
    let acceptedValues = arguments[3]
    let throwsError = arguments[4]

    for (const key in pathToKey) {
      data = data[pathToKey[key]]
      if (data === undefined) {
        throw new Error(`The value '${pathToKey[key]}' does not exist at the path '${pathToKey.join(' -> ')}' in the payload`)
      }
    } 
    let result = true
    switch (typeOfMatch) {
      case 'exactString':
        break
      case 'partial':
        break
      case 'exactNumber':
        break
      case 'greaterThan':
        break
      case 'lessThan':
        break
      default:
        throw new Error('The \'typeOfMatch\' - \'' + typeOfMatch + '\' in the configuration for the filtering of the key \'' + filterKey + '\' has a misconfigured value')
    }

  }

  get isJSONObjFiltered() {
    const isJSONObjFiltered = this[_isJSONObjFiltered]
    this[_isJSONObjFiltered] = true
    return isJSONObjFiltered
  }
}

module.exports = Filter
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
*   JSONFilterError (Error): This error is raised if the key does not exist in the payload in the first place or failure to pass all filter rules
*     is configured to raise an exception.
* Notes:
*   From a design perspective if the key doesn't even exist it should have been filtered out further upstream in the first place as oppose to having it being filtered out in this microservice. So an error will be raised
*   When looking at the values that are encountered in the JSON object the only time that a value can be undefined is when the value does not exist.
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
      //[#1]
      for (let filterKey in config) {

        let data = Object.assign({}, payload)
        let pathToKey = configJSON[filterKey]['location'].slice(0)
        let typeOfMatch = configJSON[filterKey]['typeOfMatch'].slice(0)
        let acceptedValues = configJSON[filterKey]['acceptedValues'].slice(0)
        let throwsError = configJSON['throwsError']

        for (let key in pathToKey) {
          data = data[pathToKey[key]]
          if (data === undefined) {
            throw new JSONFilterError('The value \'' + pathToKey[key] + '\' does not exist at the path \'' + pathToKey.join(' -> ') + '\' in the payload')
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
          if (Number(data) === Number(acceptedValues[0])) {
            logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was equal than the accepted number value \'' + acceptedValues[0] + '\'')
            resultArray.push(true)
          } else {
            errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was not equal than the accepted number value \'' + acceptedValues[0] + '\'')
            resultArray.push(false)
          }
          break
        case 'greaterThan':
          if (Number(data) > Number(acceptedValues[0])) {
            logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was greater than the accepted value \'' + acceptedValues[0] + '\'')
            resultArray.push(true)
          } else {
            errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was not greater than the accepted value \'' + acceptedValues[0] + '\'')
            resultArray.push(false)
          }
          break
        case 'lessThan':
          if (Number(data) < Number(acceptedValues[0])) {
            logger.debug('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was less than the accepted value \'' + acceptedValues[0] + '\'')
            resultArray.push(true)             
          } else {
            errorArray.push('The value \'' + data + '\' that was encountered for the key \'' + filterKey + '\' at the location in the data \'' + pathToKey.join(' -> ') + '\' was not less than the accepted value \'' + acceptedValues[0] + '\'')
            resultArray.push(false)
          }
          break
        default:
          throw new JSONFilterError('The \'typeOfMatch\' - \'' + typeOfMatch + '\' in the configuration for the filtering of the key \'' + filterKey + '\' has a misconfigured value')
        }
      }
      let finalResult = true
      resultArray.forEach(function(result) {
        finalResult = result && finalResult
      })
      if (!finalResult && throwsError) {
        logger.error('The data was filtered out due to the following failed filtering rules: \n' + errorArray.join('\n'))
        throw new JSONFilterError('Message payload failed to to pass all filter rules')
      } else {
        logger.warning('The data was filtered out due to the following failed filtering rules: \n' + errorArray.join('\n'))
      }
      resolve(finalResult)
    }
  )
}

module.exports = {
  filterData: filterData
}
