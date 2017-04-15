#! /bin/sh

if [ -z "$1" ]
then
	echo "Missing driver"
	echo "<Driver Name> <> <> <> <>"
	exit 1
fi

if [ -z "$2" ]
then
	echo "Missing IP Address"
	echo "<> <IP Address> <> <> <>"
	exit 1
fi

if [ -z "$3" ]
then
	echo "Missing RSA key location"
	echo "<> <> <Path/to/id_rsa> <> <>"
	exit 1
fi

if [ -z "$4" ]
then
	echo "Missing SSH User"
	echo "<> <> <> <User> <>"
	exit 1
fi

if [ -z "$5" ]
then
	echo "Missing Name of Docker-Machine"
	echo "<> <> <> <> <Name of Docker Machine>"
	exit 1
fi

docker-machine create --driver $1 --generic-ip-address=$2 --generic-ssh-key $3 --generic-ssh-user $4 $5
