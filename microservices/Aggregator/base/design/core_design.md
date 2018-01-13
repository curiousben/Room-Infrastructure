# Aggregator Core Design and Thoughts:

This markdown file documents the thoughts and assumptions about the design for the Aggregator microservice. This is subject to change based on limititations encountered when implimenting the design.

## Core Design:

This microservice has the responsiblity to collect and gather messages and keep these messages until a condition is met that will trigger a flush of data to downstream microservices. This microservices can have a few places to collect data to, the first being internal, and the second external destinations. Internal caches can be dangerous without proper planning, but can be useful if external assets are not needed. When the microservice encounters data it has not seen before it can either add this data to the cache or flush the cache and if the data has been seen previously it will add it the data to the existing cache.

## Core Design Steps:
```js
Read RedisMQ and Aggregator config file
Initialize RedisMQ subscriber and publisher
Checks if Aggregator will be using internal (Default) or third party cache.
IF (Is a third party cache is used?) {
  Initialize third party cache request and reply queues
} ELSE {
  Set cache limits for microservice and data
}
SWITCH (What storage strategy will be used?) {
  UNIQUEEVENT:
    Initialize single event based cache storage
  PEREVENT:
    Initialize multi event based cache storage
}
Listen to Subscriber queue
Receive JSON message
SWITCH (What storage strategy will be used?) {
  UNIQUEEVENT:
    IF (This event is new?) {
      Add current message to cache and then flush cache
    } ELSE {
      IF (The storage policy is uniqueData?) {
        IF (This data entry already exists?) {
          Take cached message acknowledge it then update with current message
        } ELSE {
          Create data cache entry with new message
        }
      } ELSE {
        Append message to cache.
      }
    }
    IF (Cache limit has been reached by failsafe or config?) {
      IF (Cache flush strategy is single?) {
        Flush cache in a sinlge message and ack all messages
      } ELSE {
        Flush cache in multiple messages and ack all messages
      }
    } ELSE {
      Continue
    }
  PEREVENT:
    IF (This event is new?) {
      Create new event
    }

    IF (The storage policy is uniqueData?) {
      IF (This data entry already exists?) {
        Take cached message acknowledge it then update with current message
      } ELSE {
        Update with current message
      }
      Create data cache entry with new message
    } ELSE {
      Append message to cache
    }

    IF (Cache limit has been reached by failsafe or config?) {
      IF (Cache flush strategy is single?) {
        Flush cache in a single message and ack all messages
      } ELSE {
        Flush cache in multiple messages and ack all messages
      }
    } ELSE {
      Continue
    }
```

## Message Payload

- Type: JSONObject
- Notes: This could be any size or JSON key-value depth.

_Example:_

```js
{
  "Key1":"Value1",
  "Ket2": {
    "Key1": "Value1",
    "Key2": "Value2",
    "Key3": {
    .
    .
    .
    }
  }
}
```

## Configuration
- Type: JSONObject
- **cache.setup**
  - *This determines where the cache will be located*
    - external, two queues will be made and the Aggragator will delegate the job of storing and accessing data to third-party software like key-value storage, or databases like Mongo, MySQL, etc.
    - internal, the default option stores data in local cache.
- **cache.data.RecordLabel**
  - *This is the location of the data that will be entry label in the cache. This is needed regardless of configuration choices.*
    - [Path,to,data,compare,what,to,what] is the path "much like a directory path in linux" to the data assuming the data is coming in JSON format
- **cache.data.SubRecordLabel**
  - *(OPTIONAL) When the release trigger is set on unique event size type then the storage stra.*
    - [Path,to,data,compare,what,to,what] is the path "much like a directory path in linux" to the data assuming the data is coming in JSON format
- **cache.storage.policy.strategy**
  - *This policy defines how events is stored in the cache*
    - uniqueEvent, the cache will only be gather data for one event and if another one is encountered then the cache is flushed.
    - perEvent, the cache will store data for each event and will rely on the policies to determine with the cache should be flushed.
    - NOTE: perEvent does not guarantee order when sending the cache. If order is needed its best to use unique
- **cache.storage.policy.uniqueData**
  - *This policy configuration defines how data should be organized within an event stored in cache.*
    - True: Messages that are recieved that already have the same data for a previous event in cache will be persisted in cache. The data that was previously in cahce will be acknowledged. Storage will resemble a key-value storage with the latest data for an event.
    - False: Message that are recieved will be added to a rolling list of data for a perticular event. Storage will resemble a time based ledger of data.
- **cache.storage.policy.eventLimit**
  - *This policy configuration defines how much data for an event is allowed before the cache for that event will be flushed.*
    - The cache will be emptied when the amount of data for an event is equal to this value.
    - If this configuration is set to `null` then there is no limit to the amount of data for an event.
    - NOTE: It is recommended to not have this configuration be `null` while the storage strategy is `perEvent`. Since the only way to empty is the `byteSizeWatermark`, while not fatal this might be a sign of a bad high level flow design.
- **cache.storage.byteSizeWatermark**
  - *This policy configuration defines the memory watermark for all of the internal cache.*
    - This configuration is important since this makes sure that the Aggregator microservice does not hog resources.
    - The default watermark is 50mb but can be modified by this configuration. Take care when configuring this.
- **flushStrategy**
  - *This configuration defines how messages are released from the aggregator microservice.*
    - single: The whole cache will be put into a single payload as a JSON object or an Array of JSON Objects.
    - multi: The whole cache will be broken down into smaller messages with a flag that will denote the end of a batch of messages.
- Notes: 
  - When deciding on the storage policy make sure you choose wisely since the wrong combination cause a drain on your hosts resources
  - When deciding on the flushStrategy make sure to be mindful of how big a single message can get.

```js
{
  "cache": {
    "setup": external or internal,
    "data": {
      "recordLabel": [Path,to,data,in,JSONObj], 
      "subRecordLabel": [Path,to,data,in,JSONObj], (Only needed for perEvent storage)
    },
    "storage": {
      "strategy": uniqueEvent or perEvent,
      "policy": {
        "uniqueData": true,
        "eventLimit": 10,
      },
      "byteSizeWatermark": 1000000
    },
    "flushStrategy": single or multi
  }
}
```

## Design Constraints
1. There will be a default memory cache size limit.
2. Internal cache should only be used for microservices that handle aggregations that dont exceed a reasonable memory footprint and dont need to be round-robined.

## Decision about design Constrains
1. It is possible to configure this microservice to allow more data than the memory will be able to handle so as a safety precaution the user can determine the limit to howmuch data will be able to stored in cache, assuming they chose the internal option for the aggregator.
2. Simple aggragtion jobs might not need a dedicated database and may only need a small amount of memory. This give the user more options as well as giving them the option for a more traditional database storage option if the data coming in will be a large amount.

## Library Layout
- *index.js:* Main constructor class
  - __*init:*__ Creates basic object aggregator object that pertains to the config passed in
- **cache**:
  - *perEventCache.js:* constuctor of perEvent cache
    - __*init:*__ creates cache
    - __*addData:*__ Adds data to the cache. The following events will be emitted when thresholds certain actions have been performed and depending on the event messages will be returned to the program.
      - OK: Message was successfully added to the cache. The return value shoud be OK
      - ACK: Message was successfully added to the cache and this messages needs to be acknowledged.
      - SINGLEFLUSH: Message was succesfully added to the cache and the aggregated message needs to be flushed. (Only for UniqueEvent storage policy)
      - MULTIFLUSH: Messages was sucessfully added and the following messages needs to be sent in a piecewise mannor. (Only for PerEvent storage policy)
      - ERROR: General error that occured during the processing of the message. The message is returned.
    - __*customFlush:*__ manual flushing of cache
  - *uniqueCache.js:* constructor of unique cache
    - __*init:*__ creates cache
    - __*addData:*__ Adds data to the cache. The following events will be emitted when thresholds certain actions have been performed and depending on the event messages will be returned to the program.
      - OK: Message was successfully added to the cache. The return value shoud be OK
      - ACK: Message was successfully added to the cache and this messages needs to be acknowledged.
      - SINGLEFLUSH: Message was succesfully added to the cache and the aggregated message needs to be flushed. (Only for UniqueEvent storage policy)
      - MULTIFLUSH: Messages was sucessfully added and the following messages needs to be sent in a piecewise mannor. (Only for PerEvent storage policy)
      - ERROR: General error that occured during the processing of the message. The message is returned.
    - __*customFlush:*__ manual flushing of cache
- **errors**
  - *aggregatorError.js:* Error that is thrown when the generic Aggregator methods fails
  - *initializationError.js:* Error that is thrown when loading and validating fails
- **untilMethods**
  - *initialize.js:* Loading and validating configuration
    - __*initialize:*__ Loading and validating configuration
