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
  && cp index.js "${MICROSERVICE,,}"/ \
  && cp scripts/testMicroservice.sh --parent "${MICROSERVICE,,}"/ \
  && cp package.json "${MICROSERVICE,,}"/ \
  && cp .eslintignore "${MICROSERVICE,,}"/ \
  && cp .eslintrc.json "${MICROSERVICE,,}"/ \
  && cp -R lib/ "${MICROSERVICE,,}"/ \
  && cp -R bin/ "${MICROSERVICE,,}"/ \
  && cp -R testSuite/ "${MICROSERVICE,,}"/ \
  && tar -czvf "${MICROSERVICE,,}".testSuite.tar.gz "${MICROSERVICE,,}"/ \
  && rm -r "${MICROSERVICE,,}"
}

##  Desc:
##    This method is for the handling of errors that are encountered when packaging
##      the testing suite
##  Notes:
##    N/A
##

package_testing_tarball_error_handling () {
  echo "----ERROR: Failed to create "$MICROSERVICE" testSuite tarball" \
    && rm -r "${MICROSERVICE,,}" \
    && rm "${MICROSERVICE,,}".testSuite.tar.gz
}

##  Desc:
##    This method moves the testing suite source code tarball to the docker directory
##  Notes:
##    N/A
##

move_testing_tarball () {
  echo "----INFO: Moving "$MICROSERVICE" tarball to the dist and docker folder" \
    && mv "${MICROSERVICE,,}".testSuite.tar.gz docker/"$MICROSERVICEVERSION"/"${MICROSERVICE,,}".testSuite.tar.gz
}

##  Desc:
##    This method is for the handling of errors that are encountered when moving
##      the testsuite tarball
##  Notes:
##    N/A
##

move_testing_tarball_error_handling () {
  echo "----ERROR: Failed to move "$MICROSERVICE" tarball to dist folder" \
    && rm "${MICROSERVICE,,}".testSuite.tar.gz
}

##  Desc:
##    This method checks if enough arguments have been passed in to the script.
##      Then sets the Microservice and name and version number as variables
##  Notes:
##    The variables that are set are read only and can't be reset
##

package_src_tarball () {
  echo "---INFO: Packaging "$MICROSERVICE" tarball" \
    && mkdir "${MICROSERVICE,,}" \
    && cp index.js "${MICROSERVICE,,}"/ \
    && cp scripts/startMicroservice.sh --parent "${MICROSERVICE,,}"/ \
    && cp package.json "${MICROSERVICE,,}"/ \
    && cp -R lib/ "${MICROSERVICE,,}"/ \
    && cp -R bin/ "${MICROSERVICE,,}"/ \
    && cp -R config/ "${MICROSERVICE,,}"/ \
    && tar -czvf "${MICROSERVICE,,}".tar.gz "${MICROSERVICE,,}"/ \
    && rm -r "${MICROSERVICE,,}"
}

##  Desc:
##    This method checks if enough arguments have been passed in to the script.
##      Then sets the Microservice and name and version number as variables
##  Notes:
##    The variables that are set are read only and can't be reset
##

package_src_tarball_error_handling () {
  echo "----ERROR: Failed to create "$MICROSERVICE" tarball" \
    && rm -r "${MICROSERVICE,,}" \
    && rm "${MICROSERVICE,,}".tar.gz
}

##  Desc:
##    This method checks if enough arguments have been passed in to the script.
##      Then sets the Microservice and name and version number as variables
##  Notes:
##    The variables that are set are read only and can't be reset
##

move_src_tarball () {
  echo "----INFO: Moving "$MICROSERVICE" tarball to the dist and docker folder" \
    && mv "${MICROSERVICE,,}".tar.gz docker/"$MICROSERVICEVERSION"/"${MICROSERVICE,,}".tar.gz
}

##  Desc:
##    This method checks if enough arguments have been passed in to the script.
##      Then sets the Microservice and name and version number as variables
##  Notes:
##    The variables that are set are read only and can't be reset
##

move_src_tarball_error_handling () {
  echo "----ERROR: Failed to move "$MICROSERVICE" tarball to dist folder" \
    && rm "${MICROSERVICE,,}".tar.gz
}
