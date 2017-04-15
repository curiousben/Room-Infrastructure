#!/bin/sh

if [ -z $1 ]
then
	echo "Missing Manager Node Address"
	echo ".sh <IP-Address>"
	exit 1
fi

docker swarm init --advertise-addr $1
