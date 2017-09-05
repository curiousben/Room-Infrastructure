#!/bin/sh

echo "---INFO: Packaging tarball"
cd ../ && tar -czvf node.redis.mq.tar.gz  --exclude test --exclude .DS_Store --exclude config --exclude package.sh --exclude bin --exclude node_modules --exclude config --exclude docker --exclude npm-debug.log --exclude .eslintrc.yml nodejs/
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to create tarball"
    exit 1
fi

echo "----INFO: Moving tarball to the dist folder"
mv node.redis.mq.tar.gz nodejs/docker
if [ $? -ne 0 ]
then
    echo "----ERROR: Failed to move tarball to dist folder"
    exit
fi

