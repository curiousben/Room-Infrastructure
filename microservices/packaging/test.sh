#!/usr/bin/env bash
set -eo pipefail

. "${PWD}"/testMod.sh
#check_args testing v1.00
check_set_args testing

echo "${MICROSERVICE}"
echo "${MICROSERVICEVERSION}"
