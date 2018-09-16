'user strict'

/*
* @Desc: This Class is for filtering on the assumption that the payload is a JSON
*   Object it will receive one filter rule and analyze the payload it
*   recieves and store whether or not the payload needs to be filtered or
*   not.
* @Author: Ben Smith
* @Date: Sept 9th, 2018
*/

// 'Private' class methods
const _exactStringMatch = Symbol('exactStringMatch')
const _notExactStringMatch = Symbol('notExactStringMatch')
const _exactNumberMatch = Symbol('exactNumberMatch')
const _greaterThanMatch = Symbol('greaterThanMatch')
const _lessThanMatch = Symbol('lessThanMatch')

// 'Private' class variables
const _logger = Symbol('logger')
const _filterMessages = Symbol('filterMessages')
const _isJSONObjFiltered = Symbol('isJSONObjFiltered')
const _shouldThrowError = Symbol('shouldThrowError')

class JSON {
  constructor (logger, shouldThrowError) {
    // Define logger
    this[_logger] = logger
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
      return true
    } else {
      return false
    }
  }

  /*
  * Desc:
  *   This method checks to the see if any data matchs the passed in needs to be
  *     filtered out
  * Args:
  *   data - String - The string in question
  *   acceptedValues - Array[Strings] The potential strings the data can match with
  * Throws:
  *   Error - Any error that the indexOf can throw or other RunTimeExceptions
  */
  async [_notExactStringMatch] (data, acceptedValues) {
    for (const index in acceptedValues) {
      if (acceptedValues[index].indexOf(data) !== -1) {
        return false
      }
    }
    return true
  }

  /*
  * Desc:
  *   This method checks to the see if the numbers in the accepted list
  *     match with with the data.
  * Args:
  *   data - Number - The number in question
  *   acceptedValues - Array[Number] The potential numbers the data can be equal to
  * Throws:
  *   Error - Any error that the Number class can throw or other RunTimeExceptions
  */
  async [_exactNumberMatch] (data, acceptedValues) {
    for (const index in acceptedValues) {
      if (Number(data) === Number(acceptedValues[index])) {
        return true
      }
    }
    return false
  }

  /*
  * Desc:
  *   This method check to see if the passed in number is greater than the accepted value
  * Args:
  *   data - Number - The number in question
  *   acceptedValues - Array[Number] The potential numbers the data can be greater than
  * Throws:
  *   Error - Any error that the Number class can throw or other RunTimeExceptions
  */
  async [_greaterThanMatch] (data, acceptedValues) {
    for (const index in acceptedValues) {
      if (Number(data) > Number(acceptedValues[index])) {
        return true
      }
    }
    return false
  }

  /*
  * Desc:
  *   This method check to see if the passed in number is less than the accepted value
  * Args:
  *   data - Number - The number in question
  *   acceptedValues - Array[Number] The potential numbers the data can be less than
  * Throws:
  *   Error - Any error that the Number class can throw or other RunTimeExceptions
  */
  async [_lessThanMatch] (data, acceptedValues) {
    for (const index in acceptedValues) {
      if (Number(data) < Number(acceptedValues[index])) {
        return true
      }
    }
    return false
  }

  /*
  * Desc:
  *   This methods analyzes the payload with a particular filter rule and checks to see
  *     if patload need to be filtered out based on that filter rule.
  * Args:
  *   data - Object - The whole JSON payload that is being analyzed
  *   key - String - The data that is being looked for this is more for human reading
  *   pathToKey - Array[String] - The path to the data point. Note: this CAN'T point to a JSONArray
  *   typeOfMatch - String - The type of match that will be compared to the accepted values
  *   acceptedValues - Array[String or Number] - The accepted values that will be used to determine
  *                                              if the data will be filtered out or not.
  * Throws:
  *   Error - If the path to the key is broken
  *   Error - If the type of match does not have a case.
  */
  async processPayload () {
    let data = Object.assign({}, arguments[0])
    const key = arguments[1]
    const pathToKey = arguments[2]
    const typeOfMatch = arguments[3]
    const acceptedValues = arguments[4]

    /*
    * Searchs for the data key using the pathToKey Array as a path
    *   to search for data
    */
    for (const key in pathToKey) {
      data = data[pathToKey[key]]
      if (data === undefined) {
        const errorDesc = (pathToKey, key) => `The key '${pathToKey[key]}' does not exist at the path '${pathToKey.join(' -> ')}' in the payload`
        this[_logger].error(errorDesc(pathToKey, key))
        throw new Error(errorDesc(pathToKey, key))
      }
    }

    let isFiltered = null
    switch (typeOfMatch) {
      case 'exactString':
        isFiltered = await this[_exactStringMatch](data, acceptedValues)
        if (isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for the key '${key}' at the location in the data '${pathToKey.join(' -> ')}' was not an exact match to the accepted string value(s) '${acceptedValues.join(', ')}'`)
        }
        break
      case 'notExactString':
        isFiltered = await this[_notExactStringMatch](data, acceptedValues)
        if (isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for the key '${key}' at the location '${pathToKey.join(' -> ')}' was a match when the only accepted value(s) is/are '${acceptedValues.join(', ')}'`)
        }
        break
      case 'exactNumber':
        isFiltered = await this[_exactNumberMatch](data, acceptedValues)
        if (isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for the key '${key}' at the location in the data '${pathToKey.join(' -> ')}' was not equal than the accepted number value '${acceptedValues[0]}'`)
        }
        break
      case 'greaterThan':
        isFiltered = await this[_greaterThanMatch](data, acceptedValues)
        if (isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for the key '${key}' at the location in the data '${pathToKey.join(' -> ')}' was not greater than the accepted value '${acceptedValues[0]}'`)
        }
        break
      case 'lessThan':
        isFiltered = await this[_lessThanMatch](data, acceptedValues)
        if (isFiltered) {
          this[_filterMessages].push(`The value '${data}' that was encountered for the key '${key}' at the location in the data '${pathToKey.join(' -> ')}' was not less than the accepted value '${acceptedValues[0]}'`)
        }
        break
      default:
        throw new Error(`The 'typeOfMatch' - '${typeOfMatch}' in the configuration for the filtering of the key '${key}' is not a recognized configuration value`)
    }

    // If one rule fails then the payload should not be filtered out
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
  get isJSONObjFiltered () {
    const isJSONObjFiltered = this[_isJSONObjFiltered]

    // Reset the _isJSONObjFiltered Boolean
    this[_isJSONObjFiltered] = false

    // If the Message payload should be filtered out and
    // an error should be thrown.
    if (isJSONObjFiltered && this[_shouldThrowError]) {
      const filterMessages = this[_filterMessages]
      const errorDesc = (filterMessages) => `The data was filtered out due to the following failed filtering rules: ${filterMessages}`

      // Reset the filterMessages list
      this[_filterMessages] = []

      this[_logger].error(errorDesc(filterMessages))
      throw new Error(errorDesc(filterMessages))
    } else {
      this[_logger].warn(`The data was filtered out due to the following failed filtering rules: ${this[_filterMessages].join('\n')}`)

      // Reset the filterMessages list
      this[_filterMessages] = []
    }
    return isJSONObjFiltered
  }
}

module.exports = JSON
