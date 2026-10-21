#!/usr/bin/env bash
# Pull the latest main and (re)start the stack. Run on the server from anywhere.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f deploy/.env ]]; then
  echo "deploy/.env missing. Copy deploy/.env.example and fill it in." >&2
  exit 1
fi

git pull --ff-only
docker compose -f deploy/docker-compose.yml config --quiet
docker compose -f deploy/docker-compose.yml up -d --build --remove-orphans
docker image prune -f
docker compose -f deploy/docker-compose.yml ps
echo "Deployed $(git rev-parse --short HEAD)"
