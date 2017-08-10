#!/bin/sh

echo "---INFO: Packaging tarball"
cd ../ && tar -czvf node.redis.mq.tar.gz  --exclude .DS_Store --exclude config --exclude package.sh --exclude package.json --exclude bin --exclude node_modules --exclude config nodejs/
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to create tarball"
    exit 1
fi

echo "----INFO: Moving tarball to the dist folder"
mv node.redis.mq.tar.gz ../dist/
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to move tarball to dist folder"
    exit
fi

