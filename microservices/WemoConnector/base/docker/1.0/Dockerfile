####################################
# WemoConnector Image
# Author: BenSmith(CuriousBen)
####################################

#----INFO: Image to run test suite
FROM curiousben/redismq-nodejs-amd:latest

COPY ./wemoconnector.testSuite.tar.gz /tmp/

#----INFO: Installing the WemoConnector testing Suite App and testing the microservice
RUN apk update --no-cache \
  && tar -xzvf /tmp/wemoconnector.testSuite.tar.gz -C /opt/ \
  && cd /opt/wemoconnector \
  && npm install --only=dev \
  && rm /tmp/wemoconnector.testSuite.tar.gz \
  && npm test

FROM curiousben/redismq-nodejs-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.0" \
      maintainer="benjamindsmith3@gmail.com"

#----INFO: Setting the environment to production
ENV NODE_ENV=production \
  MICROSERVICE=WemoConnector

#----INFO: Copying the local tarball into the tmp directory
COPY ./wemoconnector.tar.gz /tmp/

#----INFO: Updating package manager and installing packages and installs the WemoConnector App
RUN apk update --no-cache \
  && tar -xzvf /tmp/wemoconnector.tar.gz -C /opt/ \
  && cd /opt/wemoconnector \
  && npm install \
  && rm /tmp/wemoconnector.tar.gz \
  && npm cache verify

#----INFO: Where users enter into the container will be located within the file system
WORKDIR /opt/wemoconnector/

#----INFO: Process supervisor to handle the terminate signals that Linux sends to PID 1
ENTRYPOINT ["dumb-init","--"]

#----INFO: Actual Command that intializes the microservice
CMD ["npm","start"]

#----INFO: Example docker run command
#---- $ docker run -d --name wemoconnector -v <path/to/config/directory>:/etc/opt/wemoconnector/ curiousben/wemoconnector
