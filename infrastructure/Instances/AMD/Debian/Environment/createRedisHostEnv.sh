#!/usr/bin/env bash
set -eo pipefail

echo -e "# The maximum number of "backlogged sockets".  Default is 128.\nnet.core.somaxconn = 65535" >> /etc/sysctl.conf
echo -e "# The keneral will ALWAYS overcommit memory since this is need for this broker\nvm.overcommit_memory = 1" >> /etc/sysctl.conf
sysctl -p /etc/sysctl.conf
