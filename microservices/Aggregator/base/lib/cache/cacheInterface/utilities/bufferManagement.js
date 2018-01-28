/*eslint-env node*/
/*eslint no-console:['error', { allow: ['info', 'error'] }]*/

'use strict';

/*
* Description:
*   This method returns a buffer that was created with a supplied string
* Args:
*   string (String): This String is an externally supplied String.
* Returns:
*   string (Buffer): This Buffer is a buffer that contains the String.
* Throws:
*   N/A
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let createStringBuffer = (string) => {
  return new Promise(
    resolve => {
      resolve(Buffer.from(string, 'utf8'))
    }
  )
}

/*
* Description:
*   This method returns a JSON Object of the data that was  
* Args:
*   buffer (Buffer): This Buffer is a String Buffer that has been passed in
* Returns:
*   JSONObj (Object): This Object is an object created from the buffered String
*     that had been passed in.
* Throws:
*   SyntaxError (Exception): This Exception is thrown if the contents of the buffer are
*     not in proper JSON format
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let getJSONFromBuffer = (buffer) => {
  return new Promise(
    resolve => {
      resolve(JSON.parse(bufObj.toString()))
    }
  )
}

/*
* Description:
*   This method returns the byte length of a string.
* Args:
*   string (String): This String is the string that the byte length will be returned
* Returns:
*   length (Integer): This Integer is the byte length of the string passed in.
* Throws:
*   Exception (Exception): This Exception is thrown if the contents of the buffer are invalid
* Notes:
*   N/A
* TODO:
*   [#1]:
*/
let getBufferByteLength = (string) => {
  return new Promise(
    resolve => {
      resolve(Buffer.byteLength(string, 'utf8'))
    }
  )
}


// Exports the promise when you create this module
module.exports = {
  createStringBuffer: createStringBuffer,
  getJSONFromBuffer: getJSONFromBuffer,
  getBufferByteLength: getBufferByteLength
}
