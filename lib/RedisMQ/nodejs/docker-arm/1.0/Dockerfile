####################################
# RedisMQ Image
# Author: BenSmith(CuriousBen)
####################################

FROM resin/rpi-raspbian:stretch

#----INFO: Update package indices with the udate to date source and installing basic utilities
RUN apt-get update && apt-get install -y \
  wget \
  python2.7 \

#----INFO: Linking the python2.7 to a more accepted alias
  && ln -s /usr/bin/python2.7 /usr/bin/python \

#----INFO: Creating the directory that will house the node program
  && mkdir -p /opt/node \

#----INFO: Grabs the nodejs ARM tarball
  && wget https://nodejs.org/dist/v6.11.3/node-v6.11.3-linux-armv7l.tar.gz \

#----INFO: Untaring the nodejs ARM tarball 
  && tar --strip-components 1 -xzvf node-v6.11.3-linux-armv7l.tar.gz -C /opt/node \

#----INFO: Cleaning up left over tar
  && rm node-v6.11.3-linux-armv7l.tar.gz \

#----INFO: Linking binaries to newly installed NodeJs folder
  && ln -s /opt/node/bin/node /usr/bin/node \
  && ln -s /opt/node/lib/node /usr/lib/node \
  && ln -s /opt/node/bin/npm /usr/bin/npm \
  && ln -s /opt/node/bin/node-waf /usr/bin/node-waf \

#----INFO: Update npm globally
  && npm install npm --global

#----INFO: Coping local tarball of RedisMQ client
COPY ./node.redis.mq.tar.gz /tmp/

#----INFO: Installing the npm package for production globally
RUN npm install /tmp/node.redis.mq.tar.gz --production --global \

#----INFO: Linking the RedisMQ library so any program can use it
  && npm link redisMQ \

#----INFO: Remove the tarball of RedisMQ
  && rm /tmp/node.redis.mq.tar.gz

#----INFO: Setting the path to the global Node Modules directory and setting Node.js in production
ENV NODE_PATH=/usr/lib/node_modules/ NODE_ENV=production
