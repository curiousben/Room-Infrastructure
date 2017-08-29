#!/usr/bin/env bash
echo "----INFO: Checking to see if ran as root"
if [ $USER != "root" ]
then
	echo "----ERROR: Please run as root"
	exit 1
fi
echo "----INFO: Now downloading and installing Node.js 6.x"
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get install nodejs -y
if [ $? -ne "0" ]
then 
	echo "----ERROR: Failed to install Node.js 6.x"
	exit 1
fi 
echo "----INFO: Successfully installed Node.js 6.x"
