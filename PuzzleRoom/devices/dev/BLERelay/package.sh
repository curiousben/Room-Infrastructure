#!/bin/sh

echo "---INFO: Packaging tarball"
cd ../ && tar -czvf blerelay.tar.gz --exclude config --exclude docker --exclude package.sh --exclude node_modules BLERelay/
if [ $? -ne 0 ]
then
	echo "----ERROR: Failed to create tarball"
	exit 1
fi

echo "----INFO: Moving tarball to the dist folder"
mv blerelay.tar.gz ../dist/BLERelay/packages/ 
if [ $? -ne 0 ]
then 
	echo "----ERROR: Failed to move tarball to dist folder"
	exit
fi 

echo "----INFO: Moving config files to the dist folder"
cp BLERelay/config/* ../dist/BLERelay/config/
if [ $? -ne 0 ]
then
	echo "----ERROR: Failed to move config files to the dist folder"
	exit 1
fi

echo "----INFO: Finished packaging BLERelay"
