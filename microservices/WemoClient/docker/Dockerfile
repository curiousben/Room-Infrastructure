####################################
# BLERelay Image
# Author: BenSmith(InsatiableBen)
####################################

FROM insatiableben/redismq-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com" \
      service.id="BLE.Lights" \
      component.id="Wemo.Client"

#----INFO: Updating package manager and installing packages
RUN apt-get update && apt-get install -y \
	wget \
	vim \

#----INFO: Installing Node.js App
	&& wget https://github.com/insatiableben/Room-Infrastructure/raw/master/microservices/WemoClient/dist/wemoclient.tar.gz \
	&& tar xzvf wemoclient.tar.gz -C /opt/ \
	&& rm wemoclient.tar.gz \

#----INFO: Downloading configs for Node.js app

	&& wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/WemoClient/config/logger.config -P /etc/opt/WemoClient/ \
	&& wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/WemoClient/config/redisMQ.config -P /etc/opt/WemoClient/ \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /opt/WemoClient/
RUN npm install

CMD ['nodejs', /opt/WemoClient/bin/WemoClient.js]

#----INFO: Example docker run command
#---- $ docker run -d --name WemoClient -v <Path/to/config/on/host>:<Path/to/config/in/container> 
