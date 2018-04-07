####################################
# Aggregator Image
# Author: BenSmith(CuriousBen)
####################################

#----INFO: Image to run test suite
FROM curiousben/redismq-nodejs-amd:latest

COPY ./aggregator.testSuite.tar.gz /tmp/

RUN apt-update \

#----INFO: Installing the Aggregator testing Suite App
  && tar -xzvf /tmp/aggregator.tar.gz -C /opt/ \
  && npm install --only=dev --prefix /opt/aggregator/ \
  && rm /tmp/aggregator.tar.gz \
  && rm -rf /var/lib/apt/lists/* \

#----INFO: Installing the Aggregator testing Suite App
  && /opt/aggregator/node_modules/.bin/eslint /opt/aggregator/
  && /opt/aggregator/node_modules/.bin/mocha --recursive /opt/aggregator/

FROM curiousben/redismq-nodejs-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com"

#----INFO: Copying the local tarball into the tmp directory
COPY ./aggregator.tar.gz /tmp/

#----INFO: Updating package manager and installing packages
RUN apt-get update && apt-get install -y \
  vim \

#----INFO: Downloading configs for Node.js app
  && wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/Aggregator/base/config/logger.config -P /etc/opt/aggregator/ \
  && wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/Aggregator/base/config/redisMQ.config -P /etc/opt/aggregator/ \
  && wget https://raw.githubusercontent.com/insatiableben/Room-Infrastructure/master/microservices/Aggregator/base/config/aggregator.config -P /etc/opt/aggregator/ \

#----INFO: Installing the Aggregator App
  && tar -xzvf /tmp/aggregator.tar.gz -C /opt/ \
  && npm install --prefix /opt/aggregator/ --production \
  && rm /tmp/aggregator.tar.gz \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/aggregator/
CMD ["node", "/opt/aggregator/bin/Aggregator.js"]

#----INFO: Example docker run command
#---- $ docker run -d --name aggregator -v <path/to/config/directory>:/etc/opt/aggregator/ curiousben/aggregator
