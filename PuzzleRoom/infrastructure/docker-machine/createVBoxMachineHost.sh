#!/bin/sh
if [ -z $1 ]
then
	echo "Missing name of machine"
	echo "creat
VBoxManage hostonlyif remove vboxnet0
docker-machine create -d virtualbox --virtualbox-hostonly-cidr "21.0.0.1/24" $2
