#!/bin/bash

readonly MICROSERVICE=Aggregator

echo "---INFO: Linting the javascript for the $MICROSERVICE microservice" \
  && ./node_modules/.bin/eslint . --ext .js

if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to lint $MICROSERVICE library, microservice, and test suite"
  exit 1
fi

echo "---INFO: Linting the javascript for the $MICROSERVICE microservice" \
  && $mocha --recursive ./lib \
  && $mocha --recursive ./bin

if [ $? -ne 0 ]
then
  echo "----ERROR: Failed to test $MICROSERVICE library and microservice"
  exit 1
fi
