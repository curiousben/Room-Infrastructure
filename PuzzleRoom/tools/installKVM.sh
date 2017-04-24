#!/bin/sh

if [ $USER -ne "root" ]
then
	echo "----ERROR: Please run as root"
	exit 1
fi
## Checks if the CPU can support KVM
VIRTUALSUPPORT=$(egrep -c '(vmx|svm)' /proc/cpuinfo)
if [ "$VIRTUALSUPPORT" -eq "0" ]
then
	echo "----ERROR: Your Machine does not support KVM"
	exit 1
else
	echo "----INFO: Your Machine does support KVM"
fi

## Checks the bit of the Kernal
KERNALBIT=$(egrep -c ' lm ' /proc/cpuinfo)
if [ "$KERNALBIT" -eq "0" ]
then
	echo "----ERROR: Your CPU is not 32-bit this script is not for you"
	exit 1
else
	echo "----INFO: Your CPU is 64-bit"
fi

## Installs KVM via Package Manager
sudo apt-get install -y qemu-kvm libvirt-bin ubuntu-vm-builder bridge-utils

## Adds Users to Group
sudo adduser $USER libvirtd
printf "\n"
echo "################ KVM is installed ################"
echo "----INFO: Please logout and login so $USER can have permissions from group 'libvirtd'"
