'user strict'

/*
*
*
*
*
*/

// 'Private' class variables
const _logger = Symbol('logger')
const _jsonObj = Symbol('JSONObj')
const _filterRules = Symbol('FilterRules')
const _throwsException = Symbol('ThrowsException')

class FilterConfig {

  constructor (logger, jsonObj) {
    this[_logger] = logger
    this[_jsonObj] = jsonObj
    this[_logger].debug(`FilterConfig Object has received the following config ${JSON.stringify(jsonObj, null, 2)}
  }

  async loadConfigurations() {
    for (const filterRule of this[_jsonObj]){
      this[_filterRules].add(await this[_validateThrowErrorConfig](this[_jsonObj]))
    }
  }

  async [_validateFilterRule] (jsonObj) {

    // Checking the surface level configuration for existence and they are the arrays
    if (!('key' in jsonObj ) || !('acceptedValues' in jsonObj) || !('location' in jsonObj) || !('typeOfMatch' in jsonObj) || !('throwsError' in jsonObj)) {
      const errorDesc = `Filter configuration is missing either 'key', 'acceptedValues', 'location', 'typeOfMatch', or 'throwsError' for the filtered data ${jsonObj}.`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    const key = jsonObj['key']
    if (typeof typeOfMatch !== 'string' && !(typeOfMatch instanceof String)) {
      const errorDesc = `A Filter rule for the key ${key} is not a string. The Key configuration can only be String.`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    const acceptedValues = jsonObj['acceptedValues']
    if (typeof acceptedValues !== 'object' || acceptedValues.constructor !== Array) {
      const errorDesc = `A Filter rule for the key ${key} has encountered '[${acceptedValues.join(', ')}]' for the acceptedValues. AcceptedValues can only be an Array.`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    const locationOfData = jsonObj['location']
    if (typeof locationOfData !== 'object' || locationOfData.constructor !== Array) {
      const errorDesc = `A Filter rule for the key ${key} has encountered '[${locationOfData.join(', ')}]' for the locationOfData. LocationOfData can only be an Array.`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    const typeOfMatch = jsonObj['typeOfMatch']
    if (typeof typeOfMatch !== 'string' && !(typeOfMatch instanceof String)) {
      const errorDesc = `A Filter rule for the key ${key} has encountered '[${typeOfMatch.join(', ')}]' for the typeOfMatch .TypeOfMatch can only be a String.`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    const throwsError = jsonObj['throwsError']
    if (typeof throwsError !== 'boolean') {
      const errorDesc = `A Filter rule for the key ${key} has encountered '${throwsError}' for the throwsError. ThrowsError can only be a Boolean.`
      this[_logger].error(errorDesc)
      throw new Error(errorDesc)
    }

    resolve(jsonObj)
  }
  
  get filterRules () {
    return this[_filterRules]
  }
} 

module.exports = FilterConfig
