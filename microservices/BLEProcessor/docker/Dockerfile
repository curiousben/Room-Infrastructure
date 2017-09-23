####################################
# BLEProcessor Image
# Author: BenSmith(InsatiableBen)
####################################

FROM insatiableben/redismq-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com" \
      service.id="BLE.Lights" \
      component.id="BLE.Processor"

#----INFO: Updating package manager and installing packages
RUN apt-get update && apt-get install -y \
	vim \

#----INFO: Installing Node.js App
	&& wget https://github.com/insatiableben/Room-Infrastructure/raw/master/microservices/BLEProcessor/dist/bleprocessor.tar.gz \
	&& tar xzvf bleprocessor.tar.gz -C /opt/ \
	&& rm bleprocessor.tar.gz \

#----INFO: Downloading configs for Node.js app

	&& wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLEProcessor/config/logger.config -P /etc/opt/BLEProcessor/ \
	&& wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLEProcessor/config/redisMQ.config -P /etc/opt/BLEProcessor/ \
	&& wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/BLEProcessor/config/triangulation.config -P /etc/opt/BLEProcessor/ \
	&& rm -rf /var/lib/apt/lists/*

#----INFO: Installing Node.js app

WORKDIR /opt/BLEProcessor/
RUN npm install

CMD ['nodejs', /opt/BLEProcessor/bin/BLEProcessor.js]

#----INFO: Example docker run command
#---- $ docker run -d --name BLEProcessor -v <Path/to/config/on/host>:<Path/to/config/in/container> <imageName>
