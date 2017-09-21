#!/bin/sh

echo "================================================================"
echo "---INFO: Packaging tarball"
echo "================================================================"
cd ../ && tar -czvf node.redis.mq.tar.gz  --exclude test --exclude .DS_Store --exclude config --exclude package.sh --exclude bin --exclude node_modules --exclude config --exclude docker-amd --exclude docker-arm  --exclude npm-debug.log --exclude .eslintrc.yml nodejs/
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to create tarball"
    exit 1
fi
echo "================================================================"
echo "----INFO: Success - Created tarball"

echo "================================================================"
echo "----INFO: Copying the tarball to the ARM and AMD docker folders"
echo "================================================================"
cp node.redis.mq.tar.gz nodejs/docker-amd/node.redis.mq.tar.gz \
  && cp node.redis.mq.tar.gz nodejs/docker-arm/node.redis.mq.tar.gz \
  && rm node.redis.mq.tar.gz
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to copy or remove tarball to docker folder"
    exit
fi
echo "----INFO: Success - Copied tarball into ARM and AMD docker folders"

echo "================================================================"
echo "----INFO: Creating base docker image for ARM variant"
echo "================================================================"
cd ../docker-arm \
  && docker build -t redismq_arm --no-cache .
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to create the docker image for the ARM redisMQ"
    exit
fi
echo "----INFO: Success - Created base docker image for ARM redisMQ"

