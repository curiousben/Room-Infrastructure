#!/usr/bin/env bash
set -eo pipefail

docker run -d \
  --name broker2 \
  --hostname broker2 \
  --network=host \
  -e RABBITMQ_VM_MEMORY_HIGH_WATERMARK=0.70 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -e RABBITMQ_HIPE_COMPILE=1 \
  -e RABBITMQ_ERLANG_COOKIE="${1}" \
  -e RABBITMQ_HEAD_NODE="${2}" \
  -p 4369:4369 \
  -p 5672:5672 \
  -p 15672:15672 \
  -p 25672:25672 \
  broker_test sleep 99999999
