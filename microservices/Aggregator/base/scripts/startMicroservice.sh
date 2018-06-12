#!/usr/bin/env bash
set -eo pipefail

echo "Starting the $MICROSERVICE in a $NODE_ENV environment"
node ./bin/aggregator.js
