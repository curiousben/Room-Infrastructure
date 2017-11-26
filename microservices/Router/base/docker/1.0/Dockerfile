####################################
# Router Image
# Author: BenSmith(CuriousBen)
####################################

FROM curiousben/redismq-nodejs-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.6" \
      maintainer="benjamindsmith3@gmail.com"

#----INFO: Copying the local tarball into the tmp directory
COPY ./router.tar.gz /tmp/

#----INFO: Updating package manager and installing packages
RUN apt-get update && apt-get install -y \
  vim \

#----INFO: Downloading configs for Node.js app
  && wget https://raw.githubusercontent.com/curiousben/Room-Infrastructure/master/microservices/Router/base/config/logger.config -P /etc/opt/router/ \
  && wget https://raw.githubusercontent.com/curiousben/Room-Infrastructure/master/microservices/Router/base/config/redisMQ.config -P /etc/opt/router/ \
  && wget https://raw.githubusercontent.com/curiousben/Room-Infrastructure/master/microservices/Router/base/config/router.config -P /etc/opt/router/ \

#----INFO: Installing the Router App
  && tar -xzvf /tmp/router.tar.gz -C /opt/ \
  && npm install --prefix /opt/router/ --production \
  && rm /tmp/router.tar.gz \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/router/
CMD ["node", "/opt/router/bin/Router.js"]

#----INFO: Example docker run command
#---- $ docker run -d --name router -v <path/to/config/directory>:/etc/opt/router/ curiousben/router
