// https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
'use strict'

/*
* Description:
*   This class is a custom error class that signals the filter module encountered an error.
* Args:
*   message (String): The error message that is passed in.
* Returns:
*   FilterError (Obj): An FilterError object.
*/

class FilterError extends Error {
  constructor (message) {
    super(message)
    this.name = 'FilterError'
  }
}
module.exports = FilterError
