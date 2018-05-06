####################################
# Aggregator Image
# Author: BenSmith(CuriousBen)
####################################

#----INFO: Image to run test suite
FROM curiousben/redismq-nodejs-amd:latest

COPY ./aggregator.testSuite.tar.gz /tmp/

RUN apt-update \

#----INFO: Installing the Aggregator testing Suite App
  && tar -xzvf /tmp/aggregator.testSuite.tar.gz -C /opt/ \
  && npm install --only=dev --prefix /opt/aggregator/ \
  && rm /tmp/aggregator.testingSuite.tar.gz \
  && rm -rf /var/lib/apt/lists/* \

#----INFO: Installing the Aggregator testing Suite App
  && /opt/aggregator/node_modules/.bin/eslint /opt/aggregator/
  && /opt/aggregator/node_modules/.bin/mocha --recursive /opt/aggregator/

FROM curiousben/redismq-nodejs-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com"

#----INFO: Setting the environment to production
ENV NODE_ENV=production

#----INFO: Copying the local tarball into the tmp directory
COPY ./aggregator.tar.gz /tmp/

#----INFO: Updating package manager and installing packages and installs the Aggregator App
RUN apt-get update && apt-get install -y vim dumb-init \
  && tar -xzvf /tmp/aggregator.tar.gz -C /opt/ \
  && npm install --prefix /opt/aggregator/ --production \
  && ln -s /opt/aggregator/bin/Aggregator.js /usr/local/bin/Aggregator \
  && rm /tmp/aggregator.tar.gz \
  && rm -rf /var/lib/apt/lists/*

#----INFO: Where users enter into the container will be located within the file system
WORKDIR /opt/aggregator/

#----INFO: Process supervisor to handle the terminate signals that Linux sends to PID 1
ENTRYPOINT ["dumb-init","--"]

#----INFO: Actual Command that intializes the microservice
CMD ["Aggregator"]

#----INFO: Example docker run command
#---- $ docker run -d --name aggregator -v <path/to/config/directory>:/etc/opt/aggregator/ curiousben/aggregator
