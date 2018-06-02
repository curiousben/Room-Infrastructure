#!/usr/bin/env bash

set -eo pipefail

##  Desc:
##    This method builds the actual docker image and tags the image
##  Notes:
##    This will be either used or replaced with a CI/CD solution
##

docker_build () {
  echo "----INFO: Starting to build the "${MICROSERVICE,,}":v"$MICROSERVICEVERSION" ..." \
    && docker build -t curiousben/"${MICROSERVICE,,}" --no-cache docker/"$MICROSERVICEVERSION" \
    && docker tag curiousben/"${MICROSERVICE,,}" curiousben/"${MICROSERVICE,,}":v"$MICROSERVICEVERSION" \
    && echo "----INFO: ... Built the docker image "${MICROSERVICE,,}":v"$MICROSERVICEVERSION""
}

##  Desc:
##    This method cleans up the tarballs left from packaging the microservice
##  Notes:
##    This will be either used or replaced with a CI/CD solution
##

docker_build_error_handling () {
  echo "----ERROR: Failed to create the "$MICROSERVICE" docker image" \
    && rm docker/"$MICROSERVICEVERSION"/"${MICROSERVICE,,}".tar.gz \
    && echo "----INFO: Removed "$MICROSERVICE" tarball from docker directory"
}
