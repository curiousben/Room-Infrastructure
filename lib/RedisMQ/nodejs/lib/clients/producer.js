/*eslint-env node*/
/*eslint no-console:["error", { allow: ["info", "error"] }]*/
const redis = require('redis');
const uuid = require('uuid');
const ValidationError = require('./lib/errors/ValidationError.js');

function init(baseConfig) {
  
  var publisher = redis.createClient(baseConfig)
  return publisher
}

function send(payload) {
  if (msg.onlyMetadata(payload)) {
    var Msg = flatten('',payload);
  } else {
    var newMsg = flatten('',msg.createRedisMQMsg(payload));
  }
}
exports.createBaseClient = function(){
  return new init()producer
};
