#!/usr/bin/env sh
# Yêu cầu Coolify deploy lại một ứng dụng (kéo lại image theo tag đã cấu hình) và chờ tới khi xong.
# Dùng trong workflow deploy. Cần biến môi trường: COOLIFY_URL, COOLIFY_TOKEN, COOLIFY_APP_UUID.
set -eu
: "${COOLIFY_URL:?thiếu COOLIFY_URL}" "${COOLIFY_TOKEN:?thiếu COOLIFY_TOKEN}" "${COOLIFY_APP_UUID:?thiếu COOLIFY_APP_UUID}"
API="${COOLIFY_URL%/}/api/v1"
AUTH="Authorization: Bearer $COOLIFY_TOKEN"
OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

# Coolify mới nhận POST, bản cũ hơn chỉ nhận GET.
code=$(curl -sS -o "$OUT" -w '%{http_code}' -X POST -H "$AUTH" "$API/deploy?uuid=$COOLIFY_APP_UUID&force=false")
if [ "$code" = 405 ]; then
  code=$(curl -sS -o "$OUT" -w '%{http_code}' -H "$AUTH" "$API/deploy?uuid=$COOLIFY_APP_UUID&force=false")
fi
if [ "$code" != 200 ]; then
  echo "::error::Coolify trả HTTP $code: $(jq -r '.message // empty' "$OUT" 2>/dev/null)"
  exit 1
fi
deployment=$(jq -r '.deployments[0].deployment_uuid // empty' "$OUT")
test -n "$deployment" || { echo "::error::Coolify không trả deployment_uuid"; exit 1; }
echo "coolify: deployment $deployment"

# Chờ tối đa 10 phút.
i=0
while [ "$i" -lt 120 ]; do
  status=$(curl -fsS -H "$AUTH" "$API/deployments/$deployment" | jq -r '.status')
  case "$status" in
    finished) echo "coolify: xong"; exit 0 ;;
    failed|cancelled*) echo "::error::Coolify deploy kết thúc với trạng thái $status"; exit 1 ;;
  esac
  i=$((i + 1))
  sleep 5
done
echo "::error::Quá 10 phút mà deploy chưa xong (trạng thái cuối: $status)"
exit 1
