from kafka import KafkaProducer

def send(payload):
    accepted_types = (types.IntType, types.LongType, types.FloatType, types.BooleanType, types.DictType)
    try:
        assert isinstance(payload, accepted_types), "This message is a: {} which is not supported with this verison of sensorProducer".format(type(payload))
    except TypeError as ex:
        self.logging.error(ex)
        raise TypeError(str(ex))

    producer = KafkaProducer(bootstrap_servers='localhost:1234')
    future = producer.send('foobar', b'another_message')
    try:
        record_metadata = future.get(timeout=10)
    except KafkaError:
        # Decide what to do if produce request failed...
        log.exception()
        pass
def _msgTypeCheck():
    
