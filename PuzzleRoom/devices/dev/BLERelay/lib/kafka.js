Kafka = require('node-rdkafka');
logger = require(./logger.js);




var producer = new Kafka.Producer({
  'metadata.broker.list': 'localhost:9092',
  'dr_cb': true
});

// Connect to the broker manually
producer.connect();

// Wait for the ready event before proceeding

producer.on('ready', function() {
  try {
    producer.produce('topic',null,
      // Message to send. If a string is supplied, it will be
      // converted to a Buffer automatically, but we're being
      // explicit here for the sake of example.
      new Buffer('Awesome message'),
      // for keyed messages, we also specify the key - note that this field is optional
      'Stormwind',
      // you can send a timestamp here. If your broker version supports it,
      // it will get added. Otherwise, we default to 0
      Date.now(),
      // you can send an opaque token here, which gets passed along
      // to your delivery reports
    );
  } catch (err) {
    console.error('A problem occurred when sending our message');
    console.error(err);
  }
});

// Any errors we encounter, including connection errors
producer.on('event.error', function(err) {
  console.error('Error from producer');
  console.error(err);
})
