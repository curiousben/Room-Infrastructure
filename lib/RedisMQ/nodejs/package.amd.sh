#!/bin/sh
if [ -z $1 ]
then
    echo "Missing redisMQ version, expected syntax:"
    echo "./package.amd.sh <version-number>"
    exit 1
fi

readonly REDISMQ=redisMQ_AMD
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

echo "----INFO: Moving the $REDISMQ tarball to the AMD docker folders" \
  && mv node.redis.mq.tar.gz docker-amd/$REDISMQVERSION/node.redis.mq.tar.gz
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to move $REDISMQ tarball to Docker folder or remove the RedisMQ directory" \
    && rm node.redis.mq.tar.gz
  exit 1
fi

echo "----INFO: Creating base docker image for AMD variant" \
  && docker build -t curiousben/redismq-amd:v$REDISMQVERSION --no-cache docker-amd/$REDISMQVERSION
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to create the docker image for the AMD redisMQ" \
    && rm docker-amd/$REDISMQVERSION/node.redis.mq.tar.gz
  exit 1
fi

rm docker-amd/$REDISMQVERSION/node.redis.mq.tar.gz
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
  exit 1
fi
echo "----INFO: Success - Created base docker image for AMD redisMQ"
