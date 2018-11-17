#!/bin/bash
set -eo

## Sets the variables of the configuration file
configBase="${RABBITMQ_CONFIG_FILE:-/etc/rabbitmq/rabbitmq}"
oldConfigFile="$configBase.config"
newConfigFile="$configBase.conf"

rabbitConfigKeys=(
  default_pass
  default_user
  default_vhost
  hipe_compile
  vm_memory_high_watermark
)

# http://stackoverflow.com/a/2705678/433558
sed_escape_lhs() {
  echo "$@" | sed -e 's/[]\/$*.^|[]/\\&/g'
}
sed_escape_rhs() {
  echo "$@" | sed -e 's/[\/&]/\\&/g'
}

## Makes modifications to the RabbitMQ configuration file
rabbit_set_config() {
  local key="$1"; shift
  local val="$1"; shift

  [ -e "$newConfigFile" ] || touch "$newConfigFile"

  local sedKey="$(sed_escape_lhs "$key")"
  local sedVal="$(sed_escape_rhs "$val")"
  sed -ri \
    "s/^[[:space:]]*(${sedKey}[[:space:]]*=[[:space:]]*)\S.*\$/\1${sedVal}/" \
    "$newConfigFile"
  if ! grep -qE "^${sedKey}[[:space:]]*=" "$newConfigFile"; then
    echo "$key = $val" >> "$newConfigFile"
  fi
}

## Sets the comment or name of configuration
rabbit_comment_config() {
  local key="$1"; shift

  [ -e "$newConfigFile" ] || touch "$newConfigFile"

  local sedKey="$(sed_escape_lhs "$key")"
  sed -ri \
    "s/^[[:space:]]*#?[[:space:]]*(${sedKey}[[:space:]]*=[[:space:]]*\S.*)\$/# \1/" \
    "$newConfigFile"
}


## Command so the node joins an already existing cluster
if [ "${RABBITMQ_HEAD_NODE:-}" ]; then
  rabbitmqctl join_cluster "${RABBITMQ_HEAD_NODE}"
fi

# https://www.rabbitmq.com/memory.html#memsup-usage
if [ "${RABBITMQ_VM_MEMORY_HIGH_WATERMARK:-}" ]; then
  # https://github.com/docker-library/rabbitmq/pull/105#issuecomment-242165822
  vmMemoryHighWatermark="$(
      echo "$RABBITMQ_VM_MEMORY_HIGH_WATERMARK" | awk '
        /^[0-9]*[.][0-9]+$|^[0-9]+([.][0-9]+)?%$/ {
          perc = $0;
          if (perc ~ /%$/) {
            gsub(/%$/, "", perc);
            perc = perc / 100;
          }
          if (perc > 1.0 || perc <= 0.0) {
            printf "error: invalid percentage for vm_memory_high_watermark: %s (must be > 0%%, <= 100%%)\n", $0 > "/dev/stderr";
            exit 1;
          }
          printf "vm_memory_high_watermark.relative %0.03f\n", perc;
          next;
        }
        /^[0-9]+$/ {
          printf "vm_memory_high_watermark.absolute %s\n", $0;
          next;
        }
        /^[0-9]+([.][0-9]+)?[a-zA-Z]+$/ {
          printf "vm_memory_high_watermark.absolute %s\n", $0;
          next;
        }
        {
          printf "error: unexpected input for vm_memory_high_watermark: %s\n", $0;
          exit 1;
        }
      '
    )"
    if [ "$vmMemoryHighWatermark" ]; then
      vmMemoryHighWatermarkKey="${vmMemoryHighWatermark%% *}"
      vmMemoryHighWatermarkVal="${vmMemoryHighWatermark#$vmMemoryHighWatermarkKey }"
      rabbit_set_config "$vmMemoryHighWatermarkKey" "$vmMemoryHighWatermarkVal"
      case "$vmMemoryHighWatermarkKey" in
        # make sure we only set one or the other
        'vm_memory_high_watermark.absolute') rabbit_comment_config 'vm_memory_high_watermark.relative' ;;
        'vm_memory_high_watermark.relative') rabbit_comment_config 'vm_memory_high_watermark.absolute' ;;
      esac
    fi
  fi

## Adds Checks to see if the Erlang cookie needs to over write the cookie found in the container
if [ "${RABBITMQ_ERLANG_COOKIE:-}" ]; then
  cookieFile='/var/lib/rabbitmq/.erlang.cookie'
  if [ -e "$cookieFile" ]; then
    if [ "$(cat "$cookieFile" 2>/dev/null)" != "$RABBITMQ_ERLANG_COOKIE" ]; then
      echo >&2
      echo >&2 "warning: $cookieFile contents do not match RABBITMQ_ERLANG_COOKIE"
      echo >&2
    fi
  else
    echo "$RABBITMQ_ERLANG_COOKIE" > "$cookieFile"
  fi
  chmod 600 "$cookieFile"
fi

## Loads the environment variables based configurations
rabbit_env_config() {
  local prefix="$1"; shift

  local conf
  for conf; do
    local var="rabbitmq${prefix:+_$prefix}_$conf"
    var="${var^^}"

    local key="$conf"
    case "$prefix" in
      ssl) key="ssl_options.$key" ;;
      management_ssl) key="management.listener.ssl_opts.$key" ;;
    esac

    local val="${!var:-}"
    local rawVal="$val"
    case "$conf" in
      fail_if_no_peer_cert|hipe_compile)
        case "${val,,}" in
          false|no|0|'') rawVal='false' ;;
          true|yes|1|*) rawVal='true' ;;
        esac
        ;;

      vm_memory_high_watermark) continue ;; # handled separately
    esac

    if [ -n "$rawVal" ]; then
      rabbit_set_config "$key" "$rawVal"
    else
      rabbit_comment_config "$key"
    fi
  done
}

## Loads the Env configuration keys
rabbit_env_config '' "${rabbitConfigKeys[@]}"

## Starts the RabbitMQ Server
exec rabbitmq-server
