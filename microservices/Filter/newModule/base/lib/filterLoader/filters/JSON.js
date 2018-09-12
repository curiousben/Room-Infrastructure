'user strict'

/*
* This Class is for filtering on the assumption that the payload is a JSON
*   Object it will receive one filter rule and analyze the payload it
*   recieves and store whether or not the payload needs to be filtered or
*   not.
* @Author: Ben Smith
* @Date: Sept 9th, 2018
*/

// 'Private' class methods
const _exactStringMatch = Symbol('exactStringMatch')
const _partialMatch = Symbol('partialMatch')
const _exactNumberMatch = Symbol('exactNumberMatch')
const _greaterThanMatch = Symbol('greaterThanMatch')
const _lessThanMatch = Symbol('lessThanMatch')

// 'Private' class variables
const _filterMessages = Symbol('filterMessages')
const _isJSONObjFiltered = Symbol('isJSONObjFiltered')
const _shouldThrowError = Symbol('shouldThrowError')

class JSON {

  constructor(logger, shouldThrowError) {

    // List of filter rules that the message failed to pass
    this[_filterMessages] = []
    // Assume that the message should not be filtered out
    this[_isJSONObjFiltered] = false
    // Should an error be thrown if the message is filtered out
    this[_shouldThrowError] = shouldThrowError

  }

  /*
  * Desc:
  *   This method checks to see if there is full match with a string
  * Args:
  *   data - String - The string in question
  *   acceptedValues - Array[Strings] The potential strings the data can match with
  * Throws:
  *   Error - Any error that the indexOf can throw or other RunTimeExceptions
  */
  async [_exactStringMatch] (data, acceptedValues) {
    if (acceptedValues.indexOf(data) !== -1) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  /*
  * Desc:
  *   This method like the exact match but can match if a small portion of a possible
  *     match matchs the data.
  * Args:
  *   data - String - The string in question
  *   acceptedValues - Array[Strings] The potential strings the data can match with
  * Throws:
  *   Error - Any error that the indexOf can throw or other RunTimeExceptions
  */
  async [_partialMatch] (data, acceptedValues) {
    for (const possibleValue in acceptedValues) {
      if (acceptedValues[possibleValue].indexOf(data) !== -1) {
        resolve(true)
      }
    }
    resolve(false)
  }

  /*
  * Desc:
  *   This method checks to the see if the numbers in the accepted list
  *     match with with the data.
  * Args:
  *   data - Number - The number in question
  *   acceptedValues - Array[Number] The potential strings the data can match with
  * Throws:
  *   Error - Any error that the Number class can throw or other RunTimeExceptions
  */
  async [_exactNumberMatch] (data, acceptedValues) {
    if (Number(data) === Number(acceptedValues[0])) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  /*
  * Desc:
  *   This method check to see if the passed in number is greater than the accepted value
  * Args:
  *   data - Number - The number in question
  *   acceptedValues - Array[Number] The potential strings the data can match with
  * Throws:
  *   Error - Any error that the Number class can throw or other RunTimeExceptions
  */
  async [_greaterThanMatch] (data, acceptedValues) {
    if (Number(data) > Number(acceptedValues[0])) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  /*
  * Desc:
  *   This method check to see if the passed in number is less than the accepted value
  * Args:
  *   data - Number - The number in question
  *   acceptedValues - Array[Number] The potential strings the data can match with
  * Throws:
  *   Error - Any error that the Number class can throw or other RunTimeExceptions
  */
  async [_lessThanMatch] (data, acceptedValues) {
    if (Number(data) < Number(acceptedValues[0])) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  /*
  * Desc:
  *   This methods analyzes the payload with a particular filter rule and checks to see
  *     if patload need to be filtered out based on that filter rule.
  * Args:
  *   data - Object - The whole JSON payload that is being analyzed
  *   filterKey - String - The data that is being looked for this is more for human reading
  *   pathToKey - Array[String] - The path to the data point. Note: this CAN'T point to a JSONArray
  *   typeOfMatch - String - The type of match that will be compared to the accepted values
  *   acceptedValues - Array[String or Number] - The accepted values that will be used to determine
  *                                              if the data will be filtered out or not.
  * Throws:
  *   Error - If the path to the key is broken
  *   Error - If the type of match does not have a case.
  */
  async processPayload() {

    const data = Object.assign({}, arguments[0])
    const filterKey = arguments[1]
    const pathToKey = arguments[2]
    const typeOfMatch = arguments[3]
    const acceptedValues = arguments[4]

    for (const key in pathToKey) {
      data = data[pathToKey[key]]
      if (data === undefined) {
        throw new Error(`The value '${pathToKey[key]}' does not exist at the path '${pathToKey.join(' -> ')}' in the payload`)
      }
    } 

    let isFiltered = null
    switch (typeOfMatch) {
      case 'exactString':
        isFiltered = await [_exactStringMatch](data, acceptedValues)
        if(isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for 
                                      the key '${filterKey}' at the location in the 
                                      data '${pathToKey.join(' -> ')}' was not an 
                                      exact match to the accepted string value(s) 
                                      '${acceptedValues.join(', ')}'`)
        }
        break
      case 'partial':
        isFiltered = await [_partialMatch](data, acceptedValues)
        if(isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for 
                                      the key '${filterKey}' at the location 
                                      '${pathToKey.join(' -> ')}' was not an partial 
                                      match to the accepted value(s) 
                                      '${acceptedValues.join(', ')}'`)
        }
        break
      case 'exactNumber':
        isFiltered = await [_exactNumberMatch](data, acceptedValues)
        if(isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for 
                                      the key '${filterKey}' at the location in the 
                                      data '${pathToKey.join(' -> ')}' was not equal 
                                      than the accepted number value 
                                      '${acceptedValues[0]}'`)
        }
        break
      case 'greaterThan':
        isFiltered = await [_greaterThanMatch](data, acceptedValues)
        if(isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for 
                                      the key '${filterKey}' at the location in the 
                                      data '${pathToKey.join(' -> ')}' was not greater 
                                      than the accepted value '${acceptedValues[0]}'`)
        }
        break
      case 'lessThan':
        isFiltered = await [_lessThanMatch](data, acceptedValues)
        if (isFiltered){
          this[_filterMessages].push(`The value '${data}' that was encountered for 
                                      the key '${filterKey}' at the location in the 
                                      data '${pathToKey.join(' -> ')}' was not less 
                                      than the accepted value '${acceptedValues[0]}'`)
        }
        break
      default:
        throw new Error(`The 'typeOfMatch' - '${typeOfMatch}' in the 
                        configuration for the filtering of the key 
                        '${filterKey}' is not a recognized 
                        configuration value`)
    }
  
    // If one rule fails then the payload should be filtered out 
    if (isFiltered && !this[_isJSONObjFiltered]) {
      this[_isJSONObjFiltered] = true 
    }

  }

  /*
  * Desc:
  *   This getter method is used to get whether the payload should be filtered or not 
  *     based on the filter rules it has ued to analyze the payload.
  * Args:
  *   N/A
  * Throws:
  *   Error - If the Message payload should be filtered out and an error should be thrown.
  */
  get isJSONObjFiltered() {
    const isJSONObjFiltered = this[_isJSONObjFiltered]

    // Reset the _isJSONObjFiltered Boolean
    this[_isJSONObjFiltered] = false

    // If the Message payload should be filtered out and
    // an error should be thrown.
    if (isJSONObjFiltered && this[_shouldThrowError]) {
      const errorDesc = `The data was filtered out due to the following failed filtering rules: ${this[_filterMessages].join('\n')}` 

      // Reset the filterMessages list
      this[_filterMessages] = []

      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    } else {
      this[_logger].warning(`The data was filtered out due to the following failed filtering rules: ${this[_filterMessages].join('\n')}`)

      // Reset the filterMessages list
      this[_filterMessages] = []

    }
    return isJSONObjFiltered
  }
}

module.exports = JSON
