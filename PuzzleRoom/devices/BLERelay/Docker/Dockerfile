FROM resin/rpi-raspbian:jessie
MAINTAINER Ben Smith

RUN apt-get update && apt-get install -y \
		libtool \
		pkg-config \
		build-essential \
		autoconf \
		automake \
		python-pip \
		python-dev \
		libusb-dev \
		libdbus-1-dev \
		libglib2.0-dev \
		libudev-dev \
		libical-dev \
		libreadline-dev \
		vim \
		wget \
		tar \

####### BlueZ

		&& wget http://www.kernel.org/pub/linux/bluetooth/bluez-5.37.tar.xz /
		&& tar xzvf bluez-5.37.tar.xz /
		&& ./bluez-5.37/configure
		&& make ./bluz-5.37/
		&& make install ./bluz-5.37/
		&& pip install bluepy
		&& rm -rf /var/lib/apt/lists/*

#docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
