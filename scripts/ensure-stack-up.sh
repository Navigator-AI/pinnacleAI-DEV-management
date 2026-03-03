#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/projects/workspace/dinesh/workspace/dev_management/pinnacleAI-DEV-management"

cd "$APP_DIR"
/usr/local/bin/docker-compose up -d >/tmp/pinnacleai-ensure-up.log 2>&1
