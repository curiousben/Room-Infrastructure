// https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
'use strict'

/*
* Description:
*   This class is a custom error class that signals a message that doesn't have a body or address in the payload.
* Args:
*   message (String): The error message that is passed in.
* Returns:
*   MalformedMsgError (Obj): An MalformedMsgError object.
*/

class MalformedMsgError extends Error {
  constructor (message) {
    super(message)
    this.name = 'MalformedMsgError'
  }
}
module.exports = MalformedMsgError
