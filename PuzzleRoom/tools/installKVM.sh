#! /bin/sh

## Checks if the CPU can support KVM
VIRTUALSUPPORT=$(egrep -c '(vmx|svm)' /proc/cpuinfo)
if [ "$VIRTUALSUPPORT" -eq "0" ]
then
	echo "Your Machine does not support KVM"
	exit 1
else
	echo "Your Machine does support KVM"
fi

## Checks the bit of the Kernal
KERNALBIT=$(egrep -c ' lm ' /proc/cpuinfo)
if [ "$KERNALBIT" -eq "0" ]
then
	echo "Your CPU is not 32-bit this script is not for you"
	exit 1
else
	echo "Your CPU is 64-bit"
fi

## Installs KVM via Package Manager
sudo apt-get install -y qemu-kvm libvirt-bin ubuntu-vm-builder bridge-utils

## Adds Users to Group
sudo adduser $USER libvirtd
printf "\n"
echo "################ KVM is installed ################"
echo "Please logout and login so $USER can have"
echo "permissions from group 'libvirtd'"
