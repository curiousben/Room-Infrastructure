#!/usr/bin/env bash

##  Desc:
##    This method emits the job that failed if everything else fails
##  Notes:
##    N/A
##

main_error_handler () {
  echo "Failed to handle packaging for the microservice ${MICROSERVICE}:${MICROSERVICEVERSION}"
  exit 1
}

##  Desc:
##    This method loads all other bash scripts that has methods that would be needed for packaging
##  Notes:
##    N/A
##

init () {
  source $(dirname -- "$(readlink -f -- "$BASH_SOURCE")")/init.sh
  source $(dirname -- "$(readlink -f -- "$BASH_SOURCE")")/package.sh
  source $(dirname -- "$(readlink -f -- "$BASH_SOURCE")")/docker-build.sh
}

##  Desc:
##    This method is the main method that is evoked to package, build, and push images
##  Notes:
##    This will be either used or replaced with a CI/CD solution
##

main () {
  init \
    && checkArgs $@ \
    && package_testing_tarball || package_testing_tarball_error_handling || main_error_handler \
    && move_testing_tarball || move_testing_tarball_error_handling || main_error_handler \
    && package_src_tarball || package_src_tarball_error_handling || main_error_handler \
    && move_src_tarball || move_src_tarball_error_handling || main_error_handler \
    && docker_build || docker_build_error_handling || main_error_handler
}

main $@
