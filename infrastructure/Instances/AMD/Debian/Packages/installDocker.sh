#!/bin/bash

## these will be external to this script
INFRAUSER=instance-user
DEBIANDIST=buster
CPUARCH=AMD64

DOCKERREPO=https://download.docker.com/linux/debian/dists/$DEBIANDIST/pool/stable/${CPUARCH,,}/

echo "----INFO: Checking to see if ran as root"
if [ $USER != "root" ]
then
  echo "----ERROR: Please run as root"
  exit 1
fi
echo "----INFO: Now grabbing Docker package name"
DOCKERPACKAGE=$(curl -s $DOCKERREPO | grep docker | awk '{print $2}' | grep -o '>.*<' | awk 'END{print}' | grep -o 'docker.*.deb')
if [ $? -ne "0" ]
then 
	echo "----ERROR: Failed to grab the Docker package details. Check the page and see if assumptions are correct for this cUrl command"
	exit 1
fi
echo "----INFO: Successfully grabbed Docker package name" \
  && echo "----INFO: Starting to download the Docker Debian package" \
  && wget $DOCKERREPO$DOCKERPACKAGE -P /tmp/
if [ $? -ne "0" ]
then 
	echo "----ERROR: Failed to download the Docker Debian package"
	exit 1
fi
echo "----INFO: Successfully downloaded the Docker Debian package" \
  && echo "----INFO: Starting to install Docker" \
  && dpkg -i /tmp/$DOCKERPACKAGE
if [ $? -ne "0" ]
then 
	echo "----ERROR: Failed to install Docker"
	exit 1
fi
echo "----INFO: Successfully installed Docker" \
  && echo "----INFO: Starting to test Docker" \
  && docker run hello-world \
  && docker rm -f hello-world
if [ $? -ne "0" ]
then 
	echo "----ERROR: Docker test has failed"
	exit 1
fi
echo "----INFO: Docker test was successful" \
  && echo "----INFO: Granting rights to the infrastructure user" \
  && groupadd docker \
  && usermod -aG docker $INFRAUSER
