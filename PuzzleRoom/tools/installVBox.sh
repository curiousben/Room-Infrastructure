#! /bin/sh

if [ -z $1 ]
then
	echo "Need to specify version number pf vritualbox"
	echo "./installVBox.sh <X.X>"
	exit 1
fi

## Installs VirtualBox on a Ubuntu 16.04
sudo printf '\n## Adding Resource for Oracle VirtualBox\ndeb http://download.virtualbox.org/virtualbox/debian xenial contrib' >> /etc/apt/sources.list

## Fetching the Oracle GPG public key
wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | sudo apt-key add -

## Updating update local package index and installing virtualbox version
sudo apt-get update && apt-get install -y virtualbox-$1
