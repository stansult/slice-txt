#!/usr/bin/env bash
set -euo pipefail

: "${COMMIT_REF:?COMMIT_REF must be set}"
timestamp=$(date -u '+%Y-%m-%d %H:%M UTC')

printf "%s  %.7s\n" "$timestamp" "$COMMIT_REF" > site/build.txt
