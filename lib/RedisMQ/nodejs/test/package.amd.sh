#!/bin/bash

if [ -z $1 ]
then
    echo "Missing redisMQ version, expected syntax:"
    echo "./package.amd.sh <version-number>"
    exit 1
fi

readonly REDISMQ=redisMQ_AMD
readonly REDISMQVERSION=$1

echo "================================================================"
echo "---INFO: Packaging $REDISMQ tarball"
echo "================================================================"
mkdir RedisMQ \
  && tar -czvf node.redis.mq.tar.gz package.json lib index.js RedisMQ/
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to create $REDISMQ tarball"
  echo "================================================================"
  rm -r RedisMQ
  exit 1
fi

echo "================================================================"
echo "----INFO: Moving $REDISMQ tarball to the AMD docker folder"
echo "================================================================"
mv node.redis.mq.tar.gz docker-amd/$REDISMQVERSION
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to move $REDISMQ tarball to docker folder"
  echo "================================================================"
  rm -r RedisMQ
  exit
fi

cd docker-amd/$REDISMQVERSION \
  && docker build -t redismq_amd --no-cache . \
  && docker tag redismq_amd redismq_amd:$REDISMQVERSION
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to create the $REDISMQ docker image" 
  echo "================================================================"
  rm node.redis.mq.tar.gz
  rm -r ../../RedisMQ
  if [ $? -ne 0 ]
  then
    echo "================================================================"
    echo "----ERROR: Failed to remove $REDISMQ tarball from docker directory"
    echo "================================================================"
    exit
  fi
  echo "================================================================"
  echo "----INFO: Removed $REDISMQ tarball from docker directory"
  echo "================================================================"
  exit
fi
rm node.redis.mq.tar.gz
rm -r ../../RedisMQ
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to remove $REDISMQ tarball from docker directory"
  echo "================================================================"
  exit
fi
echo "================================================================"
echo "----INFO: Removed $REDISMQ tarball from docker directory"
echo "================================================================"
echo "================================================================"
echo "----INFO: Finished packaging $REDISMQ"
echo "================================================================"
