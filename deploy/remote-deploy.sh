#!/usr/bin/env sh
# Chép cấu hình lên VPS và chạy image theo tag. Dùng trong workflow deploy.
# Cần biến môi trường: DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY, DEPLOY_KNOWN_HOSTS.
set -eu
TAG="$1"
KEY="$(mktemp)"
KNOWN="$(mktemp)"
trap 'rm -f "$KEY" "$KNOWN"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$KEY"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$KNOWN"
chmod 600 "$KEY"
SSH="ssh -i $KEY -o UserKnownHostsFile=$KNOWN -o StrictHostKeyChecking=yes"
TARGET="$DEPLOY_USER@$DEPLOY_HOST"

scp -i "$KEY" -o UserKnownHostsFile="$KNOWN" deploy/docker-compose.yml deploy/Caddyfile deploy/rollback.sh "$TARGET:/opt/hvn-mcp/"
$SSH "$TARGET" "cd /opt/hvn-mcp && sh rollback.sh '$TAG' && docker compose up -d caddy"
