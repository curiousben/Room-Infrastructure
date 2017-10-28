####################################
# BLEFilter Image
# Author: BenSmith(CuriousBen)
####################################

FROM curiousben/redismq-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com" \

#----INFO: Copying the local tarball into the tmp directory
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
  && wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLEFilter/config/logger.config -P /etc/opt/blerelay/ \
  && wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLEFilter/config/redisMQ.config -P /etc/opt/blerelay/ \

#----INFO: Installing the BLEFilter App
  && tar -xzvf /tmp/blerelay.tar.gz -C /opt/ \
  && rm /tmp/blerelay.tar.gz \
  && npm install --prefix /opt/blerelay/ --production \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/blerelay/
CMD ["node", "/opt/blerelay/bin/BLEFilter.js"]

#----INFO: Example docker run command
#---- $ docker run -ti --privileged --net=host debian:jessie --name bletest /bin/bash
#---- $ docker run -d --name BLEFilter --privileged --net=host -v <Path/to/config/on/host>:<Path/to/config/in/container>
