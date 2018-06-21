#!/usr/bin/env bash
set -eo pipefail

echo "----INFO: Checking to see if ran as root"
if [ $USER != "root" ]
then
  echo "----ERROR: Please run as root"
  exit 1
fi

apt-get install -y \
  curl \
  vim
