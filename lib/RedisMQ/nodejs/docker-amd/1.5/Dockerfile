####################################
# RedisMQ Image
# Author: BenSmith(CuriousBen)
####################################

FROM node:6.11.4-slim
#----INFO: Labeling the image
LABEL version="1.5" \
      maintainer="benjamindsmith3@gmail.com" 

#----Update package indices with the udate to date source and installing basic utilities
RUN apt-get update && apt-get install -y \
  curl

#----Coping local tarball of RedisMQ client
COPY ./node.redis.mq.tar.gz /tmp/

#----Installing the npm package for production globally
RUN npm install /tmp/node.redis.mq.tar.gz --production --global \

#----INFO: Linking the RedisMQ library so any program can use it
  && npm link redisMQ \

#----Remove the tarball of RedisMQ
  && rm /tmp/node.redis.mq.tar.gz

#----Setting the path to the global Node Modules directory and setting Node.js in production
ENV NODE_PATH=/usr/lib/node_modules/ NODE_ENV=production
