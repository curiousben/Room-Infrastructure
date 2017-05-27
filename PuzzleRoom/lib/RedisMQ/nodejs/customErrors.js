// https://medium.com/@xjamundx/custom-javascript-errors-in-es6-aa891b173f87
'use strict'
class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ValidationError';
	}
}
modules.export {
	ValidationError: ValidationError
}
