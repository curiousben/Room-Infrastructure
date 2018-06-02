# Supported tags and respective `Dockerfile` links

 - `1.0` [(1.0/library)](https://github.com/curiousben/Room-Infrastructure/blob/master/microservices/BLERelay/base/docker/1.0/Dockerfile)

# Quick reference

- **Core Design**:
  [The `README.md` located in the design directory](https://github.com/curiousben/Room-Infrastructure/blob/master/microservices/BLERelay/base/docker/design/core_design.md)

- **Where to get help**:  
  Email is best and only way outside of the guide to get help [benjamindsmith3@gmail.com](benjamindsmith3@gmail.com). As always suggestions are very welcome.

- **Where to file issues**:  
  [https://github.com/curiousben/Room-Infrastructure/issues](https://github.com/curiousben/Room-Infrastructure/issues)

- **Maintained by**:  
  [Benjamin Smith](https://www.linkedin.com/in/ben-d-smith/) (A message based microservice middleware engineer)

- **Supported architectures**: `armv8`

- **Source of this description**:  
  [The `README.md` located in the docker directory](https://github.com/curiousben/Room-Infrastructure/blob/master/microservices/BLERelay/base/docker/1.0/README.md)

# What is BLERelay?

This microservice enables a BLE device (node) to detect any BLE device by using the host's BLE detection module. Once BLE signals have been detected this microservice sends the data using [curiousben's](https://hub.docker.com/u/curiousben/) redisMQ. The compatibility of this microservice is dependent on the host's BLE capabilities and access to a redis instance.

# How to use this image

## Running this microservice

This microservice requires that the docker host has a BLE module installed and is accessible to programs running on the host. The docker container also needs some extra network privileges from the docker host to access the BLE module, which is documented below.

## Building this images from source

To build this image from scratch clone the git repo `$ git clone https://github.com/curiousben/Room-Infrastructure.git` and navigate to the directory located at `Room-Infrastructure/microservices/BLERelay` in this root directory there is located a package script that creates the image from the `redismq-arm` image.

## Configuration

```js
{
  "node": {
    "name": ""
  }
}
```
Notes:

- Each node that picks up BLE signals has a name that will be used to collect all nodes that have detected a particular device

## Payload sent

The Payload that is sent for the BLERelay is as follows:

```js
{
  "device": {
    "uuid": "",
    "rssi": ""
  },
  "node": {
    "name": ""
  }
}
```

## Usage:

Very little is needed to use this microservice on a BLE capable device. All that is needed the node must have docker installed and sudo privilages. The following is an example docker command that is needed to initialize the node:

**_Example Docker run commands_**

`$ docker run -d --name <Custom_Name_for_container> --privileged --net=host -v <Path>/<to>/<Config>/<Directory>:/etc/opt/BLERelay/ curiousben/blerelay`

Notes:

- `--privileged --net=host` These docker run commmands is needed since the container needs to access to the network interface to use the bluetooth module.
