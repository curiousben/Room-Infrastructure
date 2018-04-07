#!/bin/bash

readonly MICROSERVICE=Aggregator

if [ -z $1 ]
then
    echo "Missing $MICROSERVICE version, expected syntax:" \
      && echo "./package.sh <version-number>"
    exit 1
fi

readonly REDISMQVERSION=$1

echo "---INFO: Packaging $MICROSERVICE testSuite tarball" \
  && mkdir ${MICROSERVICE,,} \
  && cp package.json ${MICROSERVICE,,}/ \
  && cp -R lib/ ${MICROSERVICE,,}/ \
  && cp -R bin/ ${MICROSERVICE,,}/ \
  && cp -R testSuite/ ${MICROSERVICE,,}/ \
  && tar -czvf ${MICROSERVICE,,}.testSuite.tar.gz ${MICROSERVICE,,}/ \
  && rm -r ${MICROSERVICE,,}
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to create $MICROSERVICE testSuite tarball" \
    && rm -r ${MICROSERVICE,,} \
    && rm ${MICROSERVICE,,}.testSuite.tar.gz
  exit 1
fi

echo "----INFO: Moving $MICROSERVICE tarball to the dist and docker folder" \
  && mv ${MICROSERVICE,,}.testSuite.tar.gz docker/$REDISMQVERSION/${MICROSERVICE,,}.testSuite.tar.gz
if [ $? -ne 0 ]
then 
  echo "----ERROR: Failed to move $MICROSERVICE tarball to dist folder" \
    && rm ${MICROSERVICE,,}.testSuite.tar.gz
  exit 1
fi 

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
  && mv ${MICROSERVICE,,}.tar.gz docker/$REDISMQVERSION/${MICROSERVICE,,}.tar.gz
if [ $? -ne 0 ]
then 
  echo "----ERROR: Failed to move $MICROSERVICE tarball to dist folder" \
    && rm ${MICROSERVICE,,}.tar.gz
  exit 1
fi 

docker build -t curiousben/${MICROSERVICE,,} --no-cache docker/$REDISMQVERSION \
  && docker tag curiousben/${MICROSERVICE,,} curiousben/${MICROSERVICE,,}:v$REDISMQVERSION
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to create the $MICROSERVICE docker image" \
    && rm docker/$REDISMQVERSION/${MICROSERVICE,,}.tar.gz
  if [ $? -ne 0 ]
  then
    echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
    exit 1
  fi
  echo "----INFO: Removed $MICROSERVICE tarball from docker directory"
  exit 1
fi

rm docker/$REDISMQVERSION/${MICROSERVICE,,}.tar.gz
if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to remove $MICROSERVICE tarball from docker directory"
  exit 1
fi
echo "----INFO: Finished packaging $MICROSERVICE"
