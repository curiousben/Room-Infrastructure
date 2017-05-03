FROM resin/rpi-raspbian:jessie
#----INFO: Author -  Ben Smith

RUN apt-get update && apt-get install -y \
	libusb-dev \
	libdbus-1-dev \
	libglib2.0-dev \
	libudev-dev \
	libical-dev \
	libreadline-dev \
	libbluetooth-dev \
	wget \
	curl \
	vim \

#----INFO: Installing BlueZ

	&& wget http://www.kernel.org/pub/linux/bluetooth/bluez-5.9.tar.gz /
	&& tar xzvf bluez-5.9.tar.xz /
	&& ./bluez-5.9/configure
	&& make ./bluz-5.9/
	&& sudo install ./bluz-5.9/

#----INFO: Installing Node.js 6.x

	&& curl -sL https://deb.nodesource.com/setup_6.x | bash -
	&& apt-get install -y nodejs

#----INFO: Installing Node.js App

	&& wget https://github.com/insatiableben/Puzzle-Programs/raw/master/PuzzleRoom/devices/dist/BLERelay/blerelay.tar.gz
	&& tar xzvf blerelay.tar.gz /opt/BLERelay/
	&& wget https://raw.githubusercontent.com/insatiableben/Puzzle-Programs/master/PuzzleRoom/devices/dist/BLERelay/config/logger.config -P /etc/opt/BLERelay/
	&& wget https://raw.githubusercontent.com/insatiableben/Puzzle-Programs/master/PuzzleRoom/devices/dist/BLERelay/config/kafka.config -P /etc/opt/BLERelay/
	&& rm -rf /var/lib/apt/lists/*

#----INFO: Downloading configs for Node.js app

CMD ['node', /etc/opt/blerelay/bin/]

#----INFO: Example docker run command
#---- $ docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
