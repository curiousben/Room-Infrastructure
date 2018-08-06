/*
*
* 
*
*/

const DeviceScanner = require("../../lib/utilityProcesses/DeviceScanner.js")
const winston = require('winston')
const logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})

describe('Device Scanner testing ...', function() {

  let deviceScannerObj = null

  afterEach(function() {
    deviceScannerObj.stopDeviceScanner()
    deviceScannerObj = null
  });

  it('should emit \'Discover\' event in a configurable interval', function(done) {

    // Test case configuration
    let eventsEmitted = 0
    const testEventLimit = 3

    // Test case configuration for the State Refresher
    const pollingInterval = 5

    // Timeout for this test
    this.timeout(testEventLimit * pollingInterval * 1000 + 2000)

    deviceScannerObj = new DeviceScanner(logger, pollingInterval)
    deviceScannerObj.on('Discover', function(dateOfDiscovery){
      logger.info(`Discover event has been received at the time ${dateOfDiscovery}`,{"Module":"TestSuite"}) 
      eventsEmitted++
      if (eventsEmitted === testEventLimit) {
        done()
      }
    })
    deviceScannerObj.startDeviceScanner()
  })

})
