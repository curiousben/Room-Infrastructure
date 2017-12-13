#Filter Core Design and Thoughts:

This markdown file documents the thoughts and assumptions about the design for the Router microservice. This is subject to change based on limititations encountered when implimenting the design.

## Core Design:
1. Read RedisMQ and Filter config file
2. Initialize RedisMQ subscriber and publisher
3. Listen to Subscriber queue
4. Receive JSON message
5. Route message content based on contents or configuration:
  - If message routing is content based:
    - If the message content has expected data:
      1. The router will route that message to (n) queues.
      2. Initial message is then acked.
    - else:
      1. The router will route that message to (n) other queues.
      2. Initial message is then acked.
  - If message routing is simple:
      1. The router will route that message to (n) queues.
      2. Initial message is then acked.
6. Go back to step 3

## Message Payload

- Type: JSONObject
- Notes: This could be any size or JSON key-value depth.

_Example:_

```js
{
  "someData": {
    "subData1": "",
    "subData2": {
      "subData1": "",
      "subData2": ""
    }
  },
  "someMoreData": {
    "subData1": []
  }
}
```
Depending on how routing is implemented the Router microservice wont require to know the contents of the message.

## Configuration
- Type: JSONObject
- Notes: 
  - Simple:
    - All producers that are in the producers array will be sent the message recieved from the previous microservice.
    - There can be (N) number of queues that this message can be sent to.
  - Content:
    - All keys and values that will determine the destination of messages recieved will be defined here. Each key and value will used when comparing the metadata of the message recieved.
    - There can be (N) number of key-value pairs in the "metaTagData" section
    - The matching section is where the message will be sent if all metadata keys and values match the message received. If not match the "nonMatching" will be used.

```js
{
  "Simple": {
    "publishers": [
      "publisher.1",
      "publisher.2",
      .
      .
      .
      "publisher.(N)"
    ]
  }
}
```

or

```js
{
  "Content": {
    "metaTagData": {
      "dataKey1": "dataValue1",
      "dataKey2": "dataValue2",
      .
      .
      .
      "dataKey(N)": "dataValue(N)"
    },
    "matching": [
      "publisher.1",
      "publisher.2",
      .
      .
      .
      "publisher.(N)"
    ],
    "nonMatching": [
      "publisher.1",
      "publisher.2",
      .
      .
      .
      "publisher.(N)"
    ]
  }
}
```

## Routing Constraints
1. Content-based routing will be limted to meta data.
2. If the meta data keys are not found in the receiving message this will not throw an error.
3. Simple routing behavior will only follow fanout behavior.

## Decision about Constrains
- Content-based routing will be limted to meta data.

Since content-based routing can use any facet about a message to determine if it should routed one way or another. The decision to route based on metadata was made to not have to rewrite the filter code to route based on the contents of the message. If there is a need to route based on payload content you can use a filter then pass it onto a microservice that attachs a metatag which the router will read and route accordingly. While on the head this might add more microservices, the current state of computing allows architects to add processes without much consequences.

- If the meta data keys are not found in the receiving message this will not throw an error.

Following a similiar logic from the above explaination, upstream from this router a filter can be used to filter out any acutal erroneous data before it reaches this microservice. So this microservice can only focus on routing data.


- Simple routing behavior will only follow fanout behavior.

Due to using redis as a message broker the added complexity of implementing more complex routing mechanisms for messages would add overhead at a client level since redis just doesn't support this functionality as of Decemeber 10th.

## Future

If the redis core design gets more focused on message based patterns then the simple routing section could get eliminated or will be expanded. Depending on how the filter microservice is used there is a possiblity that it's library will be fused with this router to have an all encompassing microservice.
