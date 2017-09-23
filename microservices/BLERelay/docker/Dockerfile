####################################
# BLERelay Image
# Author: BenSmith(InsatiableBen)
####################################

FROM insatiableben/redismq-arm:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com" \
      service.id="BLE.Lights" \
      component.id="BLE.Relay"

#----INFO: Updating package manager and installing packages
RUN apt-get update && apt-get install -y \
	build-essential \
	bluetooth \
	bluez \
	libbluetooth-dev \
	libudev-dev \
	libkrb5-dev \
	wget \
	vim \

#----INFO: Installing Node.js App
Room-Infrastructure/master/microservices/BLERelay/config/redisMQ.config
	&& wget https://github.com/insatiableben/Room-Infrastructure/raw/master/microservices/BLERelay/dist/blerelay.tar.gz \
	&& tar xzvf blerelay.tar.gz -C /opt/ \
	&& rm blerelay.tar.gz \

#----INFO: Downloading configs for Node.js app

	&& wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLERelay/config/logger.config -P /etc/opt/BLERelay/ \
	&& wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLERelay/config/redisMQ.config -P /etc/opt/BLERelay/ \
	&& rm -rf /var/lib/apt/lists/*

#----INFO: Installing Node.js app

WORKDIR /opt/BLERelay/
RUN npm install

CMD ['nodejs', /opt/BLERelay/bin/BLERelay.js]

#----INFO: Example docker run command
#---- $ docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
#---- $ docker run -d --name BLERelay --privileged --net=host -v <Path/to/config/on/host>:<Path/to/config/in/container>
