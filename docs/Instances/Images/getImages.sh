#!/usr/bin/env bash
set -eo pipefail

LOCALPATH=$(dirname "$(readlink -f "$0")")

echo "---INFO: Downloading the Overview image directory: $LOCALPATH" \
  && wget https://www.lucidchart.com/publicSegments/view/79f10eb2-955c-49f8-8a31-89f7ee7ac4f3/image.png -O $LOCALPATH/Overview.png \
  && echo "---INFO: Successfully downloaded current Overview"
