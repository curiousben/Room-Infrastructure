/* eslint-env node */
/* eslint no-console:["error", { allow: ["info", "error"] }] */
'use strict'

const shortid = require('shortid')

/*
* Description:
*   This function inflates the JSON object passed in with each key being sperated by a period.
* Args:
*   inputObj (Obj): The JSON object that is flattened and will be inflated.
*   outputObj (Obj): The JSON object that is inflated from the inputObj.
* Returns:
*   inflatedJSON (Obj): An inflated n-dimsional infalted JSON object. NOTE: This can only handle primative types in JS.
* Throws:
*   Error (Error):
* Notes:
*   The
* TODO:
*   [#1]:
*     N/A
*/

let inflate = (outputObj, inputObj) => {
// For each key that is in the flattened JSON file
  for (let key in inputObj) {
  // Break the key into an array delimted by the periods
    let splitKeys = key.split('.')
    // If the Key has reached the furthest branch for the key then assign the single key to the inflated JSON object
    if (splitKeys.length === 1) {
      outputObj[key] = inputObj[key]
    // If there already exists a key in the inflated then pass the contents of this object into the inflate function and pass the remaining the flattened key object
    } else if (splitKeys[0] in outputObj) {
      let newInputObj = {}
      newInputObj[splitKeys.slice(1).join('.')] = inputObj[key]
      outputObj[splitKeys[0]] = inflate(outputObj[splitKeys[0]], newInputObj)
    // If the first section of the flattened key is not found in the inflated JSON object then create a new JSON object to continues to unpack the flattened key
    } else {
      let newInputObj = {}
      newInputObj[splitKeys.slice(1).join('.')] = inputObj[key]
      outputObj[splitKeys[0]] = inflate({}, newInputObj)
    }
  }
  return outputObj
}

/*
* Description:
*  This function takes any dimension JSON object and takes each key and creates a one deminstional JSON object with the structure being perserved in the key delimited by '.'.
* Args:
*  passedKey (String): The passed in key that was parsed by the previous iteration of the flatten function. Or is empty to signify the first iteration
*  input (Obj): The JSON input that was passed in for further break down.
* Returns:
*  flattenedJSON (Obj): A flattened one-deminsional JSON object. NOTE: This can only handle primative types in JS.
* Notes:
*  Only can handle Javscript Objects and not arrays.
* TODO:
*  [#1]:
*    Need to account for arrays a bug shows up when parsing a array since Objects and Arrays are very simliar in JS.
*  [#2]:
*    Need to add exception handling.
*/

let flatten = (passedKey, input) => {
  // The JSON object where the flattened JSON object from the input will be stored
  let flattenedJSON = {}
  // Checks if type of input is an object. this is here to detect if we need to flatten the JSON object anymore
  if (typeof input === 'object') {
    // If passed key is empty then the there shouldn't be anything infront of the passed in string since it is the first iteration, else there will be period attached to the previous key passed in.
    let newKey = (passedKey === '') ? passedKey : passedKey + '.'
    // iterating over every key
    for (let key in input) {
      // Recursively create a flattened JSON by passing the concatenated newKey and key from the inflated JSON and the contents of the infalted JSON to the flatten method. Once the result is received merge the result with the parent flattened JSON.
      let flatInput = flatten(newKey + key, input[key])
      flattenedJSON = Object.assign(flattenedJSON, flatInput)
    }
    // If there is not another object to iterate then add a key to the flattened JSON and pass it back.
  } else {
    flattenedJSON[passedKey] = input
  }
  return flattenedJSON
}

/*
* Description:
*  This function creates a RedisMQ formated message with the appropriate metadata.
* Args:
*  payload (Obj): A JSON message that contains data that is being sent over RedisMQ.
* Returns:
*  redisMqMSG (Obj): A RedisMQ message that has all metadata and a payload.
* Notes:
*   The only metadata that is created with this redisMQ message is 'address', 'timestamp', and  'body'
* TODO:
*   [#1]:
*     Add some kind of messageID and  correlationId 
*/
let createRedisMQMsg = payload => {
  let redisMQMsg = {}
  redisMQMsg['address'] = shortid.generate()
  redisMQMsg['timestamp'] = String(new Date())
  redisMQMsg['body'] = payload
  return redisMQMsg
}

/*
*
* Description:
*  This function checks to see if the address and body metadata exists and they are the only keys available.
* Args:
*  redisMQMsg (Obj): A Message that was passed in.
* Returns:
*  true or false (Boolean): A true or false statement determined if the metadata is present or not.
* Notes:
*   Modular job of cheking if a passed in Object has only 'address', 'body', and 'timestamp' as keys. 
* TODO:
*   [#1]:
*     Possible combine this with hasPartialMetadata()
*/
let hasOnlyMetadata = redisMQMsg => {
  if (('address' in redisMQMsg && 'body' in redisMQMsg && 'timestamp' in redisMQMsg) && Object.keys(redisMQMsg).length === 3) {
    return true
  } else {
    return false
  }
}

/*
*
* Description:
*  This function checks to see if either the address and body metadata exists.
* Args:
*  redisMQMsg (Obj): A Message that was passed in.
* Returns:
*  (Boolean): A true or false statement determined if the metadata is present or not.
*/
let hasPartialMetadata = redisMQMsg => {
  if ('address' in redisMQMsg || 'body' in redisMQMsg || 'timestamp' in redisMQMsg) {
    return true
  } else {
    return false
  }
}

/*
*
* Description:
*  This function generates an error message that has the error message as well metadata about the microservice
*  that threw this error.
* Args:
*  metaData (Obj): Metadata about the microservice that the error was thrown from.
*  Error (Error): An error that was passed in to be stored in a queue.
* Returns:
*  errorMessage (Obj): A message that has the error message, timeStamp, service.id, and component.id.
* Throws:
*   N/A
* Notes:
*   The Payload will always have the error message and serviceID and componentID 
*/

let errorMessage = (metaData, error) => {
  let errorMessage = {}
  errorMessage['errormessage'] = '(' + error.name + '): ' + error.message
  errorMessage['serviceid'] = metaData['service.id']
  errorMessage['componentid'] = metaData['component.id']
  return errorMessage
}

/*
* Description:
*   This function breaks down an array passed and creates an object from the array's contents. Every even indice
*     is a key with the odd indice being the value for that key
* Args:
*   array (Array): An array that has key and values as element in an alterating pattern
* Returns:
*   newObj (Obj): An object created from the array that was passed in.
* Throws:
*   MessageError (Error): This error is thrown if the array passed does not have an even length or a length of zero
* Notes:
*   N/A
* TODO:
*   N/A
*/

let arrayToObj = array => {
  if (array.length !== 0 && array.length % 2 === 0) {
    return array.reduce((newObj, element, index) => {
      if (index % 2 === 0) {
        newObj[element] = array[index + 1]
      }
      return newObj
    }, {})
  } else {
    throw new Error('Array passed in does not have the correct number of elements')
  }
}
// ^ Promise for this function ^
let arrayTransform = results => {
  return new Promise(
    resolve => {
      resolve(arrayToObj(results))
    }
  )
}

// Export Functions
module.exports = {
  inflate: inflate,
  flatten: flatten,
  createRedisMQMsg: createRedisMQMsg,
  hasOnlyMetadata: hasOnlyMetadata,
  hasPartialMetadata: hasPartialMetadata,
  errorMessage: errorMessage,
  arrayTransform: arrayTransform
}
