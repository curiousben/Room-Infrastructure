####################################
# RedisMQ Image
# Author: BenSmith(InsatiableBen)
####################################

FROM resin/rpi-raspbian:jessie

# Version of nodejs being installed
ENV NODE_VERSION=v6.11.3

# Update package indices with the udate to date source and installing basic utilities
RUN apt-get update && apt-get install -y \
  wget \

# Creating the directory that will house the node program
  && mkdir -P /opt/node \

# Grab the APT repo and adds to APT keychain
  && wget https://nodejs.org/dist/{NODE_VERSION}/node-{NODE_VERSION}-linux-armv7l.tar.xz \

# Untaring the nodejs ARM installation
  && tar xzvf node-${NODE_VERSION}-linux-arm-pi.tar.gz -C /opt/node \

# Cleaning up left over tar
  && rm node-${NODE_VERSION}-linux-arm-pi.tar.gz \ 

# Linking binaries to newly installed NodeJs folder
  && ln -s /opt/node/bin/node /usr/bin/node \
  && ln -s /opt/node/lib/node /usr/lib/node \
  && ln -s /opt/node/bin/npm /usr/bin/npm \
  && ln -s /opt/node/bin/node-waf /usr/bin/node-waf \

# Update npm globally
  && npm install npm --global

# Coping local tarball of RedisMQ client
COPY ./node.redis.mq.tar.gz /tmp/

# Installing the npm package for production globally
RUN npm install /tmp/node.redis.mq.tar.gz --production --global \

# Remove the tarball of RedisMQ
  && rm /tmp/node.redis.mq.tar.gz

# Setting the path to the global Node Modules directory and setting Node.js in production
ENV NODE_PATH=/usr/lib/node_modules/ NODE_ENV=production
