#!/bin/bash


if [ "$EUID" -ne 0 ]
then
    echo "Please run as root."
    exit 1
fi
if [ -z $2 ]
then
    echo "Missing $MICROSERVICE version, expected syntax:"
    echo "./package.sh <version-number>"
    exit 1
fi

readonly MICROSERVICE=BLERelay
readonly MICROSERVICEVERSION=$1

echo "---INFO: Packaging $MICROSERVICE tarball" \
  && mkdir ${MICROSERVICE,,} \
  && cp package.json ${MICROSERVICE,,}/ \
  && cp -R lib/ ${MICROSERVICE,,}/ \
  && cp -R bin/ ${MICROSERVICE,,}/ \
  && tar -czvf ${MICROSERVICE,,}.tar.gz ${MICROSERVICE,,}/ \
  && rm -r ${MICROSERVICE,,}
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to create $MICROSERVICE tarball" \
    && rm -r ${MICROSERVICE,,} \
    && rm ${MICROSERVICE,,}.tar.gz
  exit 1
fi

echo "----INFO: Moving $MICROSERVICE tarball to the dist and docker folder" \
  && mv ${MICROSERVICE,,}.tar.gz docker/$MICROSERVICEVERSION/${MICROSERVICE,,}.tar.gz
if [ $? -ne 0 ]
then 
  echo "----ERROR: Failed to move $MICROSERVICE tarball to dist folder" \
    && rm ${MICROSERVICE,,}.tar.gz
  exit 1
fi 

docker build -t curiousben/${MICROSERVICE,,} --no-cache docker/$MICROSERVICEVERSION \
  && docker tag curiousben/${MICROSERVICE,,} curiousben/${MICROSERVICE,,}:v$MICROSERVICEVERSION
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to create the $MICROSERVICE docker image" \
  && rm docker/$MICROSERVICEVERSION/${MICROSERVICE,,}.tar.gz
  if [ $? -ne 0 ]
  then
    echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
    exit 1
  fi
  echo "----INFO: Removed $MICROSERVICE tarball from docker directory"
  exit 1
fi

rm docker/$MICROSERVICEVERSION/${MICROSERVICE,,}.tar.gz
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
  exit 1
fi
echo "----INFO: Finished packaging $MICROSERVICE"
