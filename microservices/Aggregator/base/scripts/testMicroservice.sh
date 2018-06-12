#!/usr/bin/env bash
set -eo pipefail

#----INFO: Installing the Aggregator testing Suite App
echo "Starting to test the $MICROSERVICE" \
  && /opt/aggregator/node_modules/.bin/eslint /opt/aggregator/ \
  && /opt/aggregator/node_modules/.bin/mocha --recursive /opt/aggregator/testSuite
