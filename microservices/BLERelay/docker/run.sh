#!/bin/bash

docker run -d --name BLERelay --privileged --net=host -v /home/pi/BLERelay/config:/etc/opt/BLERelay/ insatiableben/blerelay
