#!/bin/bash

echo "----INFO: Checking to see if the SSH service is running"
if [ $(systemctl is-active ssh) != "active" ]
then
  echo "INFO: The SSH service is not on turning the service back on" \
    && systemctl start ssh
fi

if [ $? -ne "0" ]
then
  echo "----ERROR: Failed to start the SSH service exiting"
    && exit 1
fi

echo "The SSH service is now active"
