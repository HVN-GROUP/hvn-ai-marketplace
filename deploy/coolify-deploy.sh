#!/usr/bin/env sh
# Yêu cầu Coolify deploy lại một ứng dụng (kéo lại image theo tag đã cấu hình) và chờ tới khi xong.
# Dùng trong workflow deploy. Cần biến môi trường: COOLIFY_URL, COOLIFY_TOKEN, COOLIFY_APP_UUID.
set -eu
: "${COOLIFY_URL:?thiếu COOLIFY_URL}" "${COOLIFY_TOKEN:?thiếu COOLIFY_TOKEN}" "${COOLIFY_APP_UUID:?thiếu COOLIFY_APP_UUID}"
API="${COOLIFY_URL%/}/api/v1"
AUTH="Authorization: Bearer $COOLIFY_TOKEN"
# Mỗi lệnh gọi API có giới hạn thời gian, để kết nối treo không giữ job tới giới hạn 6 giờ của Actions.
CURL="curl -sS --connect-timeout 10 --max-time 30"
OUT="$(mktemp)"
trap 'rm -f "$OUT"' EXIT

# Coolify mới nhận POST, bản cũ hơn chỉ nhận GET.
code=$($CURL -o "$OUT" -w '%{http_code}' -X POST -H "$AUTH" "$API/deploy?uuid=$COOLIFY_APP_UUID&force=false") || code=000
if [ "$code" = 405 ]; then
  code=$($CURL -o "$OUT" -w '%{http_code}' -H "$AUTH" "$API/deploy?uuid=$COOLIFY_APP_UUID&force=false") || code=000
fi
if [ "$code" = 000 ]; then
  echo "::error::Không kết nối được $API (kiểm tra COOLIFY_URL và tường lửa cho GitHub Actions)"
  exit 1
fi
if [ "$code" != 200 ]; then
  echo "::error::Coolify trả HTTP $code: $(jq -r '.message // empty' "$OUT" 2>/dev/null)"
  exit 1
fi
deployment=$(jq -r '.deployments[0].deployment_uuid // empty' "$OUT")
test -n "$deployment" || { echo "::error::Coolify không trả deployment_uuid"; exit 1; }
echo "coolify: deployment $deployment"

# Chờ tối đa 10 phút tính theo đồng hồ.
deadline=$(( $(date +%s) + 600 ))
status=unknown
while [ "$(date +%s)" -lt "$deadline" ]; do
  code=$($CURL -o "$OUT" -w '%{http_code}' -H "$AUTH" "$API/deployments/$deployment") || code=000
  case "$code" in
    200) status=$(jq -r '.status // empty' "$OUT") ;;
    401|403) echo "::error::Token Coolify không được đọc deployment (HTTP $code): cấp thêm quyền read cho token"; exit 1 ;;
    *) status="http-$code" ;;
  esac
  echo "coolify: trạng thái $status"
  case "$status" in
    finished) echo "coolify: xong"; exit 0 ;;
    failed|cancelled*) echo "::error::Coolify deploy kết thúc với trạng thái $status"; exit 1 ;;
  esac
  sleep 5
done
echo "::error::Quá 10 phút mà deploy chưa xong (trạng thái cuối: $status)"
exit 1
