#!/bin/bash

readonly MICROSERVICE=RedisConnector

echo "================================================================"
echo "---INFO: Packaging $MICROSERVICE tarball"
echo "================================================================"
cd ../ && tar -czvf ${MICROSERVICE,,}.tar.gz --exclude dist/ --exclude config --exclude docker --exclude package.sh --exclude node_modules --exclude design $MICROSERVICE/
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to create $MICROSERVICE tarball"
  echo "================================================================"
  exit 1
fi

echo "================================================================"
echo "----INFO: Moving $MICROSERVICE tarball to the dist and docker folder"
echo "================================================================"
cp ${MICROSERVICE,,}.tar.gz $MICROSERVICE/docker && mv ${MICROSERVICE,,}.tar.gz $MICROSERVICE/dist/
if [ $? -ne 0 ]
then 
  echo "================================================================"
  echo "----ERROR: Failed to move $MICROSERVICE tarball to dist folder"
  echo "================================================================"
  exit
fi 
docker build -t ${MICROSERVICE,,} $MICROSERVICE/docker/
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to create the $MICROSERVICE docker image"
  echo "================================================================"
  rm $MICROSERVICE/docker/${MICROSERVICE,,}.tar.gz
  if [ $? -ne 0 ]
  then
    echo "================================================================"
    echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
    echo "================================================================" 
    exit
  fi
  echo "================================================================"
  echo "----INFO: Removed $MICROSERVICE tarball from docker directory"
  echo "================================================================"
  exit
fi
rm $MICROSERVICE/docker/${MICROSERVICE,,}.tar.gz
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
  echo "================================================================" 
  exit
fi
echo "================================================================"
echo "----INFO: Removed $MICROSERVICE tarball from docker directory"
echo "================================================================"
echo "================================================================"
echo "----INFO: Finished packaging $MICROSERVICE"
echo "================================================================"
