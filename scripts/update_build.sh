#!/usr/bin/env bash
set -euo pipefail

ts=$(date '+%Y-%m-%d %H:%M')
sha=$(git rev-parse --short HEAD)

printf "%s  %s\n" "$ts" "$sha" > build.txt
