// https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
'use strict'

/*
* Description:
*   This class is a custom error class that signals the filter module encountered a JSON filtering related error.
* Args:
*   message (String): The error message that is passed in.
* Returns:
*   JSONFilterError (Obj): An JSONFilterError object.
*/

class JSONFilterError extends Error {
  constructor (message) {
    super(message)
    this.name = 'JSONFilterError'
  }
}
module.exports = JSONFilterError
