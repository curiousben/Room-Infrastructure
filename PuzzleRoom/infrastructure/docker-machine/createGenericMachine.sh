#! /bin/sh
echo "---INFO: Checking arguments passed in"

if [ $# -ne 4 ]
then
	echo "----ERROR: Incorrect arguments.\nCorrect Syntax $0 <IP-Address> <path/to/id_rsa> <SSH-User> <Name of Docker Machine>"
	exit 1
fi
echo "---INFO: Creating Docker-Machine $4"
docker-machine create --driver generic --generic-ip-address=$1 --generic-ssh-key $2 --generic-ssh-user $3 $4

if [ $? -ne 0 ]
then
	echo "----ERROR: Docker-machine creation failed"
	exit 1
fi
echo "---INFO: Docker-Machine $4 was created"
