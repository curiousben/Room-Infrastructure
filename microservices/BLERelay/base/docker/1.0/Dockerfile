####################################
# BLERelay Image
# Author: BenSmith(CuriousBen)
####################################

FROM curiousben/redismq-arm:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com" \
      service.id="BLE.Lights" \
      component.id="BLE.Relay"

COPY ./blerelay.tar.gz /tmp/

#----INFO: Updating package manager and installing packages
RUN apt-get update && apt-get install -y \
  build-essential \
  bluetooth \
  bluez \
  libbluetooth-dev \
  libudev-dev \
  libkrb5-dev \
  vim \

#----INFO: Downloading configs for Node.js app
  && wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLERelay/config/logger.config -P /etc/opt/blerelay/ \
  && wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLERelay/config/redisMQ.config -P /etc/opt/blerelay/ \

#----INFO: Installing the BLERelay App
  && tar -xzvf /tmp/blerelay.tar.gz -C /opt/ \
  && rm /tmp/blerelay.tar.gz \
  && npm install --prefix /opt/blerelay/ --production \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/blerelay/
CMD ["node", "/opt/blerelay/bin/BLERelay.js"]

#----INFO: Example docker run command
#---- $ docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
#---- $ docker run -d --name BLERelay --privileged --net=host -v <Path/to/config/on/host>:<Path/to/config/in/container>
