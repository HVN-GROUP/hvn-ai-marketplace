# Vận hành MCP server

MCP server công khai phục vụ nội dung đã duyệt cho ChatGPT tại `https://mcp.hvn.vn/mcp/chatgpt`. Server chỉ đọc, không xác thực, không lưu truy vấn hay IP.

## Môi trường

| Môi trường | Domain | Duyệt khi deploy |
|---|---|---|
| staging | `staging-mcp.hvn.vn` | Không |
| production | `mcp.hvn.vn` | Có (environment `production`) |

**Trên mỗi VPS (do HVN Cloud chuẩn bị):**
- Docker và plugin docker compose.
- Thư mục `/opt/hvn-mcp` chứa file `.env`.
- Đăng nhập GHCR bằng token có quyền `read:packages`: `docker login ghcr.io`.

Nội dung file `.env`:

```dotenv
IMAGE_TAG=<git-sha>
MCP_DOMAIN=mcp.hvn.vn
MCP_ALLOWED_HOSTS=mcp.hvn.vn
MCP_REQUESTS_PER_MINUTE=600
MCP_MAX_CONCURRENT=50
OPENAI_DOMAIN_TOKEN=
```

**Cấu hình trong GitHub, cho từng environment `staging` và `production`:**
- Secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`.
- Biến `MCP_BASE_URL`, ví dụ `https://staging-mcp.hvn.vn`.

## Deploy

Mỗi lần merge vào `main`, workflow `deploy` chạy theo thứ tự:
1. Build image `ghcr.io/hvngroup/hvn-ai-mcp:<sha>`.
2. Deploy staging rồi chạy `deploy/smoke.sh`.
3. Chờ người duyệt, sau đó deploy production và chạy smoke test lần nữa.

## Rollback

```bash
ssh <vps> 'cd /opt/hvn-mcp && sh rollback.sh <sha-trước-đó>'
```

Danh sách tag có trong GitHub > Packages > `hvn-ai-mcp`. Sau rollback, chạy `deploy/smoke.sh <url>` để xác nhận.

## Log

- **Log ứng dụng** dạng JSON, mỗi dòng gồm thời điểm, kênh, mã trạng thái, độ trễ; với dòng gọi công cụ thì có thêm tên công cụ và số mục trả về. Không ghi IP và không ghi nội dung truy vấn.
- **Caddy** không bật access log và loại bỏ log lỗi HTTP cùng log reverse proxy, vì các log này chứa IP và header. Cần xác nhận trên staging: dừng container `mcp`, gửi một request, rồi grep log Caddy xem có IPv4 không.
- **Docker** giữ tối đa 3 file × 10 MB cho mỗi container.

Lệnh xem log: `docker compose logs --since 1h mcp`.

## Giám sát

Dùng uptime monitor bên ngoài (do HCS chọn công cụ) để kiểm tra mỗi phút:
- `GET /healthz` trả 200.
- `deploy/smoke.sh` chạy được (tools/list).

Cảnh báo gửi về `kythuat@hvn.vn` và nhóm `hvn-ai-tech`.

## Thông số giới hạn

| Thông số | Mặc định | Ghi chú |
|---|---|---|
| Request mỗi phút mỗi kênh | 600 | Điều chỉnh theo load test; không giới hạn theo IP vì ChatGPT gọi từ ít IP của OpenAI |
| Request đồng thời | 50 | Quá ngưỡng trả 503 |
| Kích thước body | 64 KB | Quá ngưỡng trả 413 |
| Thời gian chờ phản hồi | 2 giây | Quá thời gian trả 504 |
| Thông điệp mỗi request | 1 | JSON-RPC batch bị từ chối (400) để một request không nhân số lần tìm kiếm |
| Độ dài `query` | 256 ký tự | Kiểm tra bằng schema của công cụ |
