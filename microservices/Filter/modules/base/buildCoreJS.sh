#!/bin/bash
set -eo pipefail

if [[ $# -ne 1 ]]
then
  echo "Missing version number, expected syntax:" \
    && echo " $0 <version-number>"
    exit 1
fi

readonly CORELIBRARY=coreLibrary
readonly CORELIBRARYTAR=${CORELIBRARY}.tar.gz

echo "[INFO] -- Starting to create the ${CORELIBRARY} tarball for deployment ..."
mkdir -p "${CORELIBRARY}"
cp filter.js "${CORELIBRARY}"
cp package.json "${CORELIBRARY}"
cp package-lock.json "${CORELIBRARY}"
cp -R lib "${CORELIBRARY}"
tar -czvf "${CORELIBRARYTAR}" "${CORELIBRARY}"
mv "${CORELIBRARYTAR}" ./docker/$1
rm -f --verbose "${CORELIBRARYTAR}"
rm -rf --verbose "${CORELIBRARY}"
echo "[INFO] -- ... Successfully created the ${CORELIBRARY} tarball for deployment"
