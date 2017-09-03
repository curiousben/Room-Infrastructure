####################################
# RedisMQ Image
# Author: BenSmith(InsatiableBen)
####################################

FROM debian

# Update package indices with the udate to date source and installing basic utilities
RUN apt-get update && apt-get install -y \
  gnupg2 \
  curl \
  telnetd \

# Grab the APT repo and adds to APT keychain
  && curl -sL https://deb.nodesource.com/setup_6.x | bash - \

# Install Node.js
  && apt-get install -y nodejs \

# Update npm globally
  && npm install npm --global

# Coping local tarball of RedisMQ client
COPY ../RedisMQ/dist/node.redis.mq.tar.gz /tmp/

# Installing the npm package global
RUN npm install /tmp/node.redis.mq.tar.gz --production --global \

# Remove the tarball of RedisMQ
  && rm /tmp/node.redis.mq.tar.gz
