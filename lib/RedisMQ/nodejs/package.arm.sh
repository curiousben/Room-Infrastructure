#!/bin/sh
if [ -z $1 ]
then
    echo "Missing redisMQ version, expected syntax:" \
      && echo "./package.arm.sh <version-number>"
    exit 1
fi

readonly REDISMQ=redisMQ_ARM
readonly REDISMQVERSION=$1

echo "---INFO: Packaging $REDISMQ tarball" \
  && mkdir RedisMQ \
  && cp package.json RedisMQ/ \
  && cp index.js RedisMQ/ \
  && cp -R lib/ RedisMQ/ \
  && tar -czvf node.redis.mq.tar.gz RedisMQ/ \
  && rm -r RedisMQ
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to create $REDISMQ tarball" \
    && rm -r RedisMQ \
    && rm node.redis.mq.tar.gz
  exit 1
fi

echo "----INFO: Moving the $REDISMQ tarball to the ARM docker folders" \
  && mv node.redis.mq.tar.gz docker-arm/$REDISMQVERSION/node.redis.mq.tar.gz
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to move $REDISMQ tarball to Docker folder or remove the RedisMQ directory" \
    && rm node.redis.mq.tar.gz
  exit 1
fi

echo "----INFO: Creating base docker image for ARM variant" \
  && docker build -t curiousben/redismq-nodejs-arm --no-cache docker-arm/$REDISMQVERSION \
  && docker tag curiousben/redismq-nodejs-arm curiousben/redismq-nodejs-arm:v$REDISMQVERSION
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to create the docker image for the ARM redisMQ" \
    && rm docker-arm/$REDISMQVERSION/node.redis.mq.tar.gz
  exit 1
fi

rm docker-arm/$REDISMQVERSION/node.redis.mq.tar.gz \
  && echo "----INFO: Success - Created base docker image for ARM redisMQ"
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
  exit 1
fi
