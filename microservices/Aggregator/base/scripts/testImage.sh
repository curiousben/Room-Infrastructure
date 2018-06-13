#!/usr/bin/env bash

docker run -d --name aggregator-test --link RedisBroker:redis-broker -v /home/cortana/aggregator:/opt/aggregator/config/ curiousben/aggregator sleep 99999999
