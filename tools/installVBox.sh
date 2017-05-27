#!/bin/sh

if [ $# -ne 1 ]
then 
	echo "----ERROR: Need to specify version number of virtualbox. Correct syntax is $0 <X.X>"
	exit 1
fi

if [ $USER != "root" ]
then
	echo "----ERROR: Please run as root"
	exit 1
fi

echo "----INFO: Installs VirtualBox on a Ubuntu 16.04"
echo -e '\n## Adding Resource for Oracle VirtualBox\ndeb http://download.virtualbox.org/virtualbox/debian xenial contrib' >> /etc/apt/sources.list

echo "----INFO: Fetching the Oracle GPG public key"
wget -q https://www.virtualbox.org/download/oracle_vbox_2016.asc -O- | apt-key add -

echo "---INFO: Updating update local package index and installing virtualbox version"
apt-get update && apt-get install -y virtualbox-$1
