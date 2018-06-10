#!/usr/bin/env bash
set -oe pipefail

echo "----INFO: Checking to see if ran as root."
if [ $USER != "root" ]
then
  echo "----ERROR: Please run as root."
  exit 1
fi

echo "----INFO: Installing scripts."
cp -r ./buildNodeJSMicroservice /usr/local/lib/
chmod +x -R /usr/local/lib/buildNodeJSMicroservice
chown $SUDO_USER:$SUDO_USER -R /usr/local/lib/buildNodeJSMicroservice
ln -s /usr/local/lib/buildNodeJSMicroservice/buildNodeJSMicroservice.sh /usr/local/bin/buildNodeJSMicroservice
chmod +x /usr/local/bin/buildNodeJSMicroservice
chown $SUDO_USER:$SUDO_USER /usr/local/bin/buildNodeJSMicroservice
echo "----INFO: Succcessfully installed buildNodeJSMicroservice."
