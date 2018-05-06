#!/usr/bin/env bash
set -eo pipefail

##
##  Desc: 
##    This method packages the source code for the microservice that will be 
##      built. This can either include the testSuite or the actual src code.
##
##  Note:
##    There is an assumed directory structure that has to be satisfied for a
##      successful packaging job. The assumed structure is as follows:
##  .
##  ├── bin
##  │   ├── Microservice 1
##  │   ├── Microservice 2
##  │   ├── .
##  │   └── .
##  ├── config
##  │   ├── Config 1
##  │   ├── Config 2
##  │   ├── .
##  │   └── .
##  ├── design
##  │   └── core_design.md
##  ├── docker
##  │   ├── 1.0
##  │   │   ├── Dockerfile
##  │   │   └── README.md
##  │   ├── 1.x
##  │   │   ├── Dockerfile
##  │   │   └── README.md
##  │   ├── X.0
##  │   │   ├── Dockerfile
##  │   │   └── README.md
##  │   └── .
##  │       ├── Dockerfile
##  │       └── README.md
##  ├── lib
##  │   ├── Core Code Library
##  │   └── methods
##  │       └── ..
##  └── testSuite
##      ├── Core test suite
##      └── methods
##          └── ..

package_testing_tarball () {
echo "---INFO: Packaging "$MICROSERVICE" testSuite tarball" \
  && mkdir "${MICROSERVICE,,}" \
  && cp package.json "${MICROSERVICE,,}"/ \
  && cp -R lib/ "${MICROSERVICE,,}"/ \
  && cp -R bin/ "${MICROSERVICE,,}"/ \
  && cp -R testSuite/ "${MICROSERVICE,,}"/ \
  && tar -czvf "${MICROSERVICE,,}".testSuite.tar.gz "${MICROSERVICE,,}"/ \
  && rm -r "${MICROSERVICE,,}"
}

## Cleanup for Failed Tarball
package_testing_tarball_error_handling () {
  echo "----ERROR: Failed to create "$MICROSERVICE" testSuite tarball" \
    && rm -r "${MICROSERVICE,,}" \
    && rm "${MICROSERVICE,,}".testSuite.tar.gz
}

## Moving tarball to docker directory
move_testing_tarball () {
  echo "----INFO: Moving "$MICROSERVICE" tarball to the dist and docker folder" \
    && mv "${MICROSERVICE,,}".testSuite.tar.gz docker/"$MICROSERVICEVERSION"/"${MICROSERVICE,,}".testSuite.tar.gz
}

## Moving tarball of microservice src to docker directory
move_testing_tarball_error_handling () {
  echo "----ERROR: Failed to move "$MICROSERVICE" tarball to dist folder" \
    && rm "${MICROSERVICE,,}".testSuite.tar.gz
}

## Moving tarball of microservice src to docker directory
package_src_tarball () {
  echo "---INFO: Packaging "$MICROSERVICE" tarball" \
    && mkdir "${MICROSERVICE,,}" \
    && cp package.json "${MICROSERVICE,,}"/ \
    && cp -R lib/ "${MICROSERVICE,,}"/ \
    && cp -R bin/ "${MICROSERVICE,,}"/ \
    && cp -R config/ "${MICROSERVICE,,}"/ \
    && tar -czvf "${MICROSERVICE,,}".tar.gz "${MICROSERVICE,,}"/ \
    && rm -r "${MICROSERVICE,,}"
}

## Cleanup on failure to create tarball of microservice
package_src_tarball_error_handling () {
  echo "----ERROR: Failed to create "$MICROSERVICE" tarball" \
    && rm -r "${MICROSERVICE,,}" \
    && rm "${MICROSERVICE,,}".tar.gz
}

## Moving the tarball to the docker folder
move_src_tarball () {
  echo "----INFO: Moving "$MICROSERVICE" tarball to the dist and docker folder" \
    && mv "${MICROSERVICE,,}".tar.gz docker/"$MICROSERVICEVERSION"/"${MICROSERVICE,,}".tar.gz
}

## Cleanup after the docker folder
move_src_tarball_error_handling () {
  echo "----ERROR: Failed to move "$MICROSERVICE" tarball to dist folder" \
    && rm "${MICROSERVICE,,}".tar.gz
}
