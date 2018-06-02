// https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
'use strict'

/*
* Description:
*   This class is a custom error class that signals a the filter configuration is incomplete.
* Args:
*   message (String): The error message that is passed in.
* Returns:
*   FilterInitializationError (Obj): An FilterInitializationError object.
*/

class FilterInitializationError extends Error {
  constructor (message) {
    super(message)
    this.name = 'FilterInitializationError'
  }
}
module.exports = FilterInitializationError
