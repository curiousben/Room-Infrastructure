FROM debian:jessie 
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
 && rm -rf /var/lib/apt/lists/*

####### BlueZ

wget http://www.kernel.org/pub/linux/bluetooth/bluez-5.37.tar.xz
tar xvf bluez-5.37.tar.xz
cd bluez-5.37
./configure
make
sudo make install
sudo pip install bluepy

####### ZeroMQ

wget https://github.com/jedisct1/libsodium/releases/download/1.0.3/libsodium-1.0.3.tar.gz
tar -zxvf libsodium-1.0.3.tar.gz
cd libsodium-1.0.3/
./configure
make
sudo make install

wget http://download.zeromq.org/zeromq-4.1.3.tar.gz
tar -zxvf zeromq-4.1.3.tar.gz
cd zeromq-4.1.3/
./configure
make
sudo make install
sudo ldconfig

sudo pip install pyzmq




#docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
