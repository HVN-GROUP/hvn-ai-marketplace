#!/usr/bin/env sh
# Quay về image cũ trên VPS. Dùng: deploy/rollback.sh <git-sha-cũ>
# Chạy trong /opt/hvn-mcp trên máy chủ cần rollback.
set -eu
TAG="$1"
sed -i "s/^IMAGE_TAG=.*/IMAGE_TAG=$TAG/" .env
docker compose pull mcp
docker compose up -d mcp
echo "rollback: đang chạy $TAG"
