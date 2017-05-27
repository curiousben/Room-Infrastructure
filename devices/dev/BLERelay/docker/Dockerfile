FROM resin/rpi-raspbian:jessie
#----INFO: Author -  Ben Smith

RUN apt-get update && apt-get install -y \
	build-essential \
	bluetooth \
	bluez \
	libbluetooth-dev \
	libudev-dev \
	libkrb5-dev \
	wget \
	curl \
	vim \

#----INFO: Installing Node.js 6.x

	&& curl -sL https://deb.nodesource.com/setup_6.x | bash - \
	&& apt-get install -y nodejs \
#----	&& npm install -g node-gyp \

#----INFO: Installing Node.js App

	&& wget https://github.com/insatiableben/Puzzle-Programs/raw/master/PuzzleRoom/devices/dist/BLERelay/packages/blerelay.tar.gz \
	&& tar xzvf blerelay.tar.gz -C /opt/ \
	&& rm blerelay.tar.gz \

#----INFO: Downloading configs for Node.js app

	&& wget https://raw.githubusercontent.com/insatiableben/Puzzle-Programs/master/PuzzleRoom/devices/dist/BLERelay/config/logger.config -P /etc/opt/BLERelay/ \
	&& wget https://raw.githubusercontent.com/insatiableben/Puzzle-Programs/master/PuzzleRoom/devices/dist/BLERelay/config/kafka.config -P /etc/opt/BLERelay/ \
	&& rm -rf /var/lib/apt/lists/*

#----INFO: Installing Node.js app

WORKDIR /opt/BLERelay/
RUN npm install

CMD ['nodejs', /opt/BLERelay/bin/ble_relay]

#----INFO: Example docker run command
#---- $ docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
