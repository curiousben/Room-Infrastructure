/*
*
* 
*
*/

const StateRefresher = require("../../lib/utilityProcesses/StateRefresher.js")
const winston = require('winston')
const logger = new winston.Logger({
  level: 'error',
  transports: [
    new (winston.transports.Console)()
  ]
})
const should = require('chai').should()

describe('StateRefresher testing ...', function() {

  let stateRefresherObj = null
  before(function() {
    // runs before all tests in this block
  });

  after(function() {
    // runs after all tests in this block
  });

  afterEach(function() {
    stateRefresherObj.stopStateRefresher()
    stateRefresherObj = null
  });

  it('should emit \'SwitchOff\' event in a configurable interval',function(done) {
    
    // Test case configuration
    let eventsEmitted = 0
    const testEventLimit = 1

    // Test case configuration for the State Refresher
    const pollingInterval = 5

    // Timeout for this test
    this.timeout(testEventLimit * pollingInterval * 1000 + 2000)

    stateRefresherObj = new StateRefresher(logger, pollingInterval)
    stateRefresherObj.on('SwitchOff', function(dateOfSwitchOff){
      logger.info(`SwitchOff event has been received at the time ${dateOfSwitchOff}`,{"Module":"TestSuite"}) 
      eventsEmitted++
      if (eventsEmitted === testEventLimit) {
        done()
      }
    })
    stateRefresherObj.startStateRefresher()
  })

  it('should delay the countdown for and never emit a \'Switch Off\' event',function(done) {
    
    // Test case configuration
    let numberOfDelays= 0
    const testDelayLimit = 3

    // Test case configuration for the State Refresher
    const pollingInterval = 4

    // Timeout for this test
    this.timeout(testDelayLimit * pollingInterval * 1000 + 2000)

    stateRefresherObj = new StateRefresher(logger, pollingInterval)

    // If a SwitchOff event is received then the test failed
    stateRefresherObj.on('SwitchOff', function(dateOfSwitchOff){
      done(new Error("\'Switch Off\' event has been emmitted"))
    })

    // Delay interval that will emit delay events to the state refresher, the time
    // that it fires a delay event is always half of the polling period so the test
    // cases resets the timer and not the built-in reset
    const delayTimer = setInterval(function(){
      numberOfDelays++
      if (numberOfDelays === testDelayLimit) {
        clearTimeout(delayTimer)
        done()
      }
      stateRefresherObj.delayRefresh('TestEventString')
    }, (pollingInterval * 1000)/2)
    stateRefresherObj.startStateRefresher()
  })

})
