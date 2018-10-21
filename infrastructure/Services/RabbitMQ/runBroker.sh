#!/usr/bin/env bash
set -eo pipefail

readonly GENERATED_ERLANG_COOKIE=$(openssl rand -base64 40 |  tr -- '+=/' '-_~')

docker run -d \
  --hostname broker1 \
  --name broker1 \
  -e RABBITMQ_NODENAME=broker1 \
  -e RABBITMQ_VM_MEMORY_HIGH_WATERMARK=0.70 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -e RABBITMQ_HIPE_COMPILE=1 \
  -e RABBITMQ_ERLANG_COOKIE="${GENERATED_ERLANG_COOKIE}" \
  -p 4369:4369 \
  -p 5672:5672 \
  -p 15672:15672 \
  -p 25672:25672 \
  test sleep 9999999999

echo "The Cookie that should be used to cluster is ${GENERATED_ERLANG_COOKIE}"

