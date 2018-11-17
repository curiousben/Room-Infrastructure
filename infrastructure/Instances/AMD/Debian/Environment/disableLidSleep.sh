#!/usr/bin/env bash
set -eo pipefail

echo "---- Checking to see if ran as root"
if [ $USER != "root" ]
then
	echo "----ERROR: Please run as root"
	exit 1
fi
echo "----INFO: Modifing logind.conf file"
sed -i 's/#HandleLidSwitch=suspend/HandleLidSwitch=ignore/g' /etc/systemd/logind.conf
if [ $? -ne "0" ]
then 
	echo "----ERROR: Failed to modify logind.conf file"
	exit 1
fi 
echo "----INFO: Restarting systemd-logind service"
service systemd-logind restart
if [ $? -ne "0" ]
then 
	echo "----ERROR: Failed to restart systemd-logind service"
	exit 1
fi 
