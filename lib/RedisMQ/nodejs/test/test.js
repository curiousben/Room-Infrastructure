var redis = require('redis')
var async = require('async')
var client = redis.createClient()
function testify(callback){
  console.log('safe')
  client.brpoplpush('testQueue', 'BLERelay.process', 0, function(err, results){
    isListening = false 
    callback(results)
  })
}
//setInterval(testify, 10);

var isListening = false
setInterval(function() {
  if (isListening === false) {
    isListening = true
    testify(function(results){
      console.log(results)
    });
  }
}, 5)
