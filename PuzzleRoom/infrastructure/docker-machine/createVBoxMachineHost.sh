#!/bin/sh

echo "----INFO: Checking arguments passed in"
if [ $# -ne 1 ]
then
	echo "----ERROR: Incorrect arguments.\nCorrect Syntax $0 <Name of docker-machine>"
	exit 1
fi

echo "----INFO: Removing the vboxnet0 network interface"
VBoxManage hostonlyif remove vboxnet0

if [ $? -ne 0 ]
then
	echo "----ERROR: vboxnet0 failed to be deleted"
	exit 1
fi

echo "----INFO: Creating Docker-Machine $1"
docker-machine create -d virtualbox --virtualbox-hostonly-cidr "21.0.0.1/24" $1

if [ $? -ne 0 ]
then
	echo "----ERROR: Docker-machine creation failed"
	exit 1
fi

echo "----INFO: Docker-Machine $1 was created"
