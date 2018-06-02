#!/usr/bin/env bash
set -eo pipefail

##  Desc:
##    This method checks if enough arguments have been passed in to the script.
##      Then sets the Microservice and name and version number as variables
##  Notes:
##    The variables that are set are read only and can't be reset
##

checkArgs () {
  if [[ $# -ne 2 ]]
  then
    echo "Missing Microservice name or version, expected syntax:" \
      && echo "<microservice Name> <version-number>"
      exit 1
  fi

  readonly LOCALPATH="$PWD"
  readonly MICROSERVICE="$1"
  readonly MICROSERVICEVERSION="$2"
}
