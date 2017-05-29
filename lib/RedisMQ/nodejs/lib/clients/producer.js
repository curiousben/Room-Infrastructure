/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const redis = require('redis');
const jsonfile = require('jsonfile');
const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const config = require('./lib/configMethods.js');
const configData = null;
const ValidationError = require('./lib/errors/ValidationError.js');

