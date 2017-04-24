#!/bin/sh

echo "---INFO: Packaging tarball"
cd ../ && tar -czvf blerelay.tar.gz --exclude docker --exclude package.sh --exclude node_modules BLERelay/

if [ $? -ne 0 ]
then
	echo "----ERROR: Failed to create tarball"
	exit 1
fi
echo "----INFO:"
mv blerelay.tar.gz ../dist/BLERelay/ 

if [ $? -ne 0 ]
then 
	echo "----ERROR: Failed to move tarball to dist folder"
	exit
fi 

echo "----INFO: Finished packaging BLERelay"
