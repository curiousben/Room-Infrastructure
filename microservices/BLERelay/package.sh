#!/bin/sh

echo "================================================================"
echo "---INFO: Packaging tarball"
echo "================================================================"
cd ../ && tar -czvf blerelay.tar.gz --exclude dist/ --exclude config --exclude docker --exclude package.sh --exclude node_modules BLERelay/
if [ $? -ne 0 ]
then
  echo "================================================================"
  echo "----ERROR: Failed to create tarball"
  echo "================================================================"
  exit 1
fi

echo "================================================================"
echo "----INFO: Moving tarball to the dist and docker folder"
echo "================================================================"
cp blerelay.tar.gz BLERelay/docker && mv blerelay.tar.gz BLERelay/dist/
if [ $? -ne 0 ]
then 
  echo "================================================================"
  echo "----ERROR: Failed to move tarball to dist folder"
  echo "================================================================"
  exit
fi 

echo "================================================================"
echo "----INFO: Finished packaging BLERelay"
echo "================================================================"
