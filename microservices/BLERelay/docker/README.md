# Supported tags and respective `Dockerfile` links

 - `1.0` [(1.0/library)](https://github.com/insatiableben/Room-Infrastructure/blob/master/microservices/BLERelay/docker/1.0/Dockerfile)

# Quick reference


- **Where to get help**:  
  Email is best and only way outside of the guide to get help [benjamindsmith3@gmail.com](benjamindsmith3@gmail.com). As always suggestions are very welcome.

- **Where to file issues**:  
  [https://github.com/insatiableben/Room-Infrastructure/issues](https://github.com/insatiableben/Room-Infrastructure/issues)

- **Maintained by**:  
  [Benjamin Smith](https://www.linkedin.com/in/42656e/) (A message based microservice middleware engineer)

- **Supported architectures**: `armv8`

- **Source of this description**:  
  [The `/README.md` in the root directory](https://github.com/insatiableben/Room-Infrastructure/blob/master/microservices/BLERelay/docker/1.0/Dockerfile)
  
# What is BLERelay?

This microservice detects any BLE device that its able to detect BLE signals using the host's BLE detection module. Once BLE signals have been detected this microservice sends the data using the [curiousben's](https://hub.docker.com/u/curiousben/) redisMQ. The compatibility of this microservice is dependent on the host's BLE capabilities and access to a redis instance.

# How to use this image

## Running this microservice

This microservice require that the docker host has a BLE module installed and accessible to programs running on the host. The docker containe also needs some extra network privileges from the docker host to access the BLE module, which is documented below.

**_Example Docker run commands_**

`$ docker run -d --name BLERelay --privileged --net=host -v /home/pi/BLERelay/config:/etc/opt/BLERelay/ insatiableben/blerelay`

## Building this images from scratch

To build this image from scratch clone the git repo `$ git clone https://github.com/curiousben/Room-Infrastructure.git` and navigate to the directory located at `Room-Infrastructure/microservices/BLERelay` in this root directory there is located a package script that creates the image from the `redismq-arm` image.

## Configuration

```js
{
  "node": {
    "name": "",
    "uuid": ""
  }
}
```
Note:

- Having both a producer and subscriber is not enforced but you must make sure you have at least one of them configured.
## Payload sent

The general configuration for the BLERelay is as follows:

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
