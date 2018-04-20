#!/bin/sh

echo "---INFO: Checking arguments passed in"
if [ $# -ne 1 ]
then
	echo "----ERROR: Missing Manager Node Address. Correct syntax $0 <Swarm-Head-IP-Address>"
	exit 1
fi

docker swarm init --advertise-addr $1

if [ $? -ne 0 ]
then
	echo "----ERROR: Docker-Swarm creation failed"
	exit 1
fi

