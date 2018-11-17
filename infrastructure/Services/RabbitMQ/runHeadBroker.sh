#!/usr/bin/env bash
set -eo pipefail

readonly GENERATED_ERLANG_COOKIE=$(openssl rand -base64 40 |  tr -- '+=/' '-_~')

docker run -d \
  --hostname broker1 \
  --name broker1 \
  --network="host" \
  -e RABBITMQ_VM_MEMORY_HIGH_WATERMARK=0.70 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=admin123 \
  -e RABBITMQ_HIPE_COMPILE=0 \
  -e RABBITMQ_ERLANG_COOKIE="${GENERATED_ERLANG_COOKIE}" \
  broker_test

echo "The Cookie that should be used to cluster is ${GENERATED_ERLANG_COOKIE}"

