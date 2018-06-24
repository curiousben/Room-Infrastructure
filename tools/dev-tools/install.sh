#!/usr/bin/env bash
set -oe pipefail

echo "----INFO: Checking to see if ran as root."
if [ $USER != "root" ]
then
  echo "----ERROR: Please run as root."
  exit 1
fi

echo "----INFO: Installing Build NodeJS Microservice scripts."
cp -r ./packaging/buildNodeJSMicroservice /usr/local/lib/
chmod +x -R /usr/local/lib/buildNodeJSMicroservice
chown $SUDO_USER:$SUDO_USER -R /usr/local/lib/buildNodeJSMicroservice
ln -s /usr/local/lib/buildNodeJSMicroservice/buildNodeJSMicroservice.sh /usr/local/bin/buildNodeJSMicroservice
chmod +x /usr/local/bin/buildNodeJSMicroservice
chown $SUDO_USER:$SUDO_USER /usr/local/bin/buildNodeJSMicroservice
echo "----INFO: Succcessfully installed Build NodeJS Microservice scripts."
echo "----INFO: Installing generate docs scripts."
cp -r ./docs /usr/local/lib/
chmod +x -R /usr/local/lib/docs
chown $SUDO_USER:$SUDO_USER -R /usr/local/lib/docs
ln -s /usr/local/lib/buildNodeJSMicroservice/buildNodeJSMicroservice.sh /usr/local/bin/generateDocs
chmod +x /usr/local/bin/generateDocs
chown $SUDO_USER:$SUDO_USER /usr/local/bin/generateDocs
echo "----INFO: Succcessfully installed generate docs scripts."
