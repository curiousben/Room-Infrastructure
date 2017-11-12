# Supported tags and respective `Dockerfile` links

 - `1.0` [(1.0/library)](https://github.com/curiousben/Room-Infrastructure/blob/master/microservices/Filter/base/docker/1.0/Dockerfile)

# Quick reference

- **Where to get help**:  
  Email is best and only way outside of the guide to get help [benjamindsmith3@gmail.com](benjamindsmith3@gmail.com). As always suggestions are very welcome.

- **Where to file issues**:  
  [https://github.com/curiousben/Room-Infrastructure/issues](https://github.com/curiousben/Room-Infrastructure/issues)

- **Maintained by**:  
  [Benjamin Smith](https://www.linkedin.com/in/42656e/) (A message based microservice middleware engineer)

- **Supported architectures**: `amd64`

- **Source of this description**:  
  [The `/README.md` in the root directory](https://github.com/curiousben/Room-Infrastructure/blob/master/microservices/Filter/base/docker/1.0/README.md)
  
# What is Filter Microservice?

This microservice enables message filtering based on value comparison. Messages that are received by this microservice then sends data using [curiousben's](https://hub.docker.com/u/curiousben/) redisMQ depending if the data needs to be filtered.

# How to use this image

## Running this microservice

This microservice requires that the host has docker daemon installed and the configuration to be in a seperate folder so that the container can access it.

## Building this images from source

To build this image from scratch clone the git repo `$ git clone https://github.com/curiousben/Room-Infrastructure.git` and navigate to the directory located at `Room-Infrastructure/microservices/Filter` in this root directory there is located a package script that creates the image from the `redismq-amd` image. Make sure to pass in a correct version number

## Configuration

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
Notes:

- Notes: As of Nov 11th only one value comparison can be performed but expanded functionality is planned
	- acceptedValues: Is all potential combinations that values will be compared against.
	- location: Is the location of where the `<key>` is located. All array elements are position sensitive.
	- typeOfMatch: This determines how the comparison will take place. the choices as of Nov 11th are `exact` and `partial`

## Payload sent

The message payload for the Filter microservice is dependent on the upstream message data structure.

## Usage:

The following is an example docker command that is needed to initialize the node:

**_Example Docker run commands_**

`$ docker run -d --name <Custom_Name_for_container> -v <Path>/<to>/<Config>/<Directory>:/etc/opt/filter/ curiousben/filter`
