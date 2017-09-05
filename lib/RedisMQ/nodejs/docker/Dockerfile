####################################
# RedisMQ Image
# Author: BenSmith(InsatiableBen)
####################################

FROM debian

# Update package indices with the udate to date source and installing basic utilities
RUN apt-get update && apt-get install -y \
  gnupg2 \
  curl \
  telnet \

# Grab the APT repo and adds to APT keychain
  && curl -sL https://deb.nodesource.com/setup_6.x | bash - \

# Install Node.js
  && apt-get install -y nodejs \

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
