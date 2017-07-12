// https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
'use strict'

/*
* Description:
*   This class is a custom error class that is only there to add extra infromation when an error comes up when loading the RedisMQ config file.
* Args:
*   message (String): The error message that is passed in.
* Returns:
*   MessageError (Obj): An MessageError object.
*/

class MessageError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MessageError'
  }
}
module.exports = MessageError
