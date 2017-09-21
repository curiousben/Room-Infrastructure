#!/bin/sh

echo "================================================================"
echo "---INFO: Packaging tarball"
echo "================================================================"
cd ../ && tar -czvf node.redis.mq.tar.gz  --exclude test --exclude .DS_Store --exclude config --exclude package.sh --exclude bin --exclude node_modules --exclude config --exclude docker-amd --exclude docker-arm  --exclude npm-debug.log --exclude .eslintrc.yml nodejs/
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to create tarball"
  echo "================================================================"
  exit 1
fi
echo "================================================================"
echo "----INFO: Success - Created tarball"
echo "================================================================"

echo "================================================================"
echo "----INFO: Copying the tarball to the AMD docker folders"
echo "================================================================"
cp node.redis.mq.tar.gz nodejs/docker-amd/node.redis.mq.tar.gz \
  && rm node.redis.mq.tar.gz
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to copy or remove tarball to docker folder"
  echo "================================================================"
  exit
fi
echo "================================================================"
echo "----INFO: Success - Copied tarball into AMD docker folders"
echo "================================================================"

echo "================================================================"
echo "----INFO: Creating base docker image for AMD variant"
echo "================================================================"
cd nodejs/docker-amd \
  && docker build -t redismq_amd --no-cache .
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to create the docker image for the AMD redisMQ" 
  echo "================================================================"
  exit
fi

echo "================================================================"
echo "----INFO: Success - Created base docker image for AMD redisMQ"
echo "================================================================"

echo "================================================================"
echo "----INFO: Creating base docker image for AMD variant"
echo "================================================================"
cd nodejs/docker-amd \
  && docker build -t redismq_amd --no-cache .
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to create the docker image for the AMD redisMQ" 
    exit
fi
echo "----INFO: Success - Created base docker image for AMD redisMQ"

