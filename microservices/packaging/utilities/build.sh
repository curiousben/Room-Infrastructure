#!/usr/bin/env bash
set -eo pipefail

## Building the DockerImage for the microservice
docker_build () {
  echo "----INFO: Starting to build the "${MICROSERVICE,,}":v"$MICROSERVICEVERSION" ..." \
    && docker build -t curiousben/"${MICROSERVICE,,}" --no-cache docker/"$MICROSERVICEVERSION" \
    && docker tag curiousben/"${MICROSERVICE,,}" curiousben/"${MICROSERVICE,,}":v"$MICROSERVICEVERSION" \
    && echo "----INFO: ... Built the docker image "${MICROSERVICE,,}":v"$MICROSERVICEVERSION""
}

docker_build_error_handling () {
  echo "----ERROR: Failed to create the "$MICROSERVICE" docker image" \
    && rm docker/"$MICROSERVICEVERSION"/"${MICROSERVICE,,}".tar.gz \
    && echo "----INFO: Removed "$MICROSERVICE" tarball from docker directory"
}
