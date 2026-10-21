#!/usr/bin/env sh
# Kiểm tra nhanh sau deploy: healthz, tools/list và fetch một tài liệu cố định.
# Dùng: deploy/smoke.sh https://staging-mcp.hvn.vn
set -eu
BASE="$1"
H='-H content-type:application/json -H accept:application/json,text/event-stream -H mcp-protocol-version:2025-06-18'

curl -fsS "$BASE/healthz" | grep -q ok
# shellcheck disable=SC2086
curl -fsS $H -X POST "$BASE/mcp/chatgpt" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | grep -q '"search"'
# shellcheck disable=SC2086
curl -fsS $H -X POST "$BASE/mcp/chatgpt" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"fetch","arguments":{"id":"hvn-claude.bat-dau-voi-claude.lo-trinh-90-ngay"}}}' \
  | grep -q 'Lộ trình 90 ngày'
echo "smoke: đạt $BASE"
