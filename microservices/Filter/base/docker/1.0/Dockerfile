####################################
# Filter Image
# Author: BenSmith(CuriousBen)
####################################

FROM curiousben/redismq-nodejs-amd:latest

#----INFO: Labeling the image
LABEL version="1.0" \
      redisMQ.version="1.6" \
      maintainer="benjamindsmith3@gmail.com"

#----INFO: Copying the local tarball into the tmp directory
COPY ./filter.tar.gz /tmp/

#----INFO: Updating package manager and installing packages
RUN apt-get update && apt-get install -y \
  vim \

#----INFO: Downloading configs for Node.js app
  && wget https://raw.githubusercontent.com/curiousben/Room-Infrastructure/master/microservices/Filter/base/config/logger.config -P /etc/opt/filter/ \
  && wget https://raw.githubusercontent.com/curiousben/Room-Infrastructure/master/microservices/Filter/base/config/redisMQ.config -P /etc/opt/filter/ \
  && wget https://raw.githubusercontent.com/curiousben/Room-Infrastructure/master/microservices/Filter/base/config/filter.config -P /etc/opt/filter/ \

#----INFO: Installing the Filter App
  && tar -xzvf /tmp/filter.tar.gz -C /opt/ \
  && npm install --prefix /opt/filter/ --production \
  && rm /tmp/filter.tar.gz \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/filter/
CMD ["node", "/opt/filter/bin/Filter.js"]

#----INFO: Example docker run command
#---- $ docker run -d --name filter -v <path/to/config/directory>:/etc/opt/filter/ curiousben/filter
