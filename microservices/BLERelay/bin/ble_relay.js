const redisMQ =  require('redisMQ')
const noble =  require('noble')
const redisMQConfig = '../config/redismq.config'
const loggerConfig = '.,/config/logger.config'
bluebird.promisifyAll(noble)
// Starting BLE scanning
noble.startScanning();

// Starting the producer 
redisMQ.createPublisher(loggerConfig, redisMQConfig, 'ble.relay').then(publisher=> {
  noble.on('discover', function(peripheral) {
    console.log('Found device with local name: ' + peripheral.advertisement.localName);
    console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);
  	publisher.produce('topic',-1, 'Values from peripherals','BLE-SkepOne');
  });Plet i = 0
})


