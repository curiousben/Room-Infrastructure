#Filter Core Design and Thoughts:

This markdown file documents the thoughts and assumptions about the design for the Filter microservice. This is subject to change based on limititations encountered when implimenting the design.

## Core Design:
1. Read RedisMQ and Filter config file
2. Initialize RedisMQ subscriber and publisher
3. Listen to Subscriber queue
4. Receive JSON message
5. Compares message's content based on configurations.
6. If message contains an accepted value:
- Perform logic for case 1
7. If message does not contain an accepted value:
- Perform logic for case 2
8. Repeat 3

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
With this message payload the Filter will know from configuration how deep and where to go in the JSON message to get the value it needs to filter out.

## Configuration
- Type: JSONObject
- Notes: 
  - value: This array holds the possible values that the key in the JSObject that are not being filtered out.
  - location: This array holds the position sensitive location of the key.
  - typeOfMatch: This option determines to what degree the data must match with the accepted values to filter out the message. ("exact" or "partial")
  - If there are mutliple keys only if all keys exist and have values that match values in the acceptedValues array will the message not be filtered out.

```js
{
  "data": {
    "<key>": {
      "acceptedValues": [],
      "location": [],
      "typeOfMatch": ""
    }
  }
}
```

## Data transmission Constraints
1. Configuration will have the location of the data in the JSON object, accepted values, and type of match threshold.
2. Accepted values can only be non-multideminsional objects or arrays.
3. Filtering results will only result in a binary outcome.

## Decision about Constrains
- Configuration will have the location of the data in the JSON object, accepted values, and type of match threshold.

When filtering a couple of questions comes to mind what should I be filtered? Where is this data that needs to be filtered? What are the values that should not be filtered out? How strict should the threshold be for filtering? These configurations satisfies these questions and makes what should be filtered out and what shouldn't apparent.

- Accepted values can only be non-multideminsional objects or arrays.

Due to overhead looking through multi-deminsional objects only comparing strings and numbers makes filtering easier. There is a in-built javascript function includes() for sub-strings and "===" for exact comparison for strings and numbers.

- Filtering results will only result in a binary outcome.

## Future

Multiple outcomes could be in a future version of the filter then the pattern will then start to approach a more complex router pattern. More thought is needed on this. Also allowing the configuration to account for comparison of multiple data values within the message.
