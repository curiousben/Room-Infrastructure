#!/bin/sh
echo "----INFO: Checking passed in arguments"
if [ $? -ne 0 ]
then
	echo "----ERROR: This script does not require any input variables"
	exit 1
fi

