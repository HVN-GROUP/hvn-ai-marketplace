# Vận hành MCP server

MCP server công khai phục vụ nội dung đã duyệt cho ChatGPT tại `https://mcp.hvn.vn/mcp/chatgpt`. Server chỉ đọc, không xác thực, không lưu truy vấn hay IP.

## Môi trường

Hai ứng dụng loại Docker Image trên VPS Coolify dùng chung của HVN GROUP (VPS này còn chạy ứng dụng khác).

| Môi trường | Domain | Ứng dụng Coolify | Image tag | Khi nào deploy |
|---|---|---|---|---|
| staging | `staging-mcp.hvn.vn` | `hvn-mcp-staging` | `staging` | Tự động sau mỗi merge vào `main` |
| production | `mcp.hvn.vn` | `hvn-mcp-production` | `production` | Khi bấm tay Run workflow với `production_sha` |

**Mỗi ứng dụng trong Coolify:**
- Image `ghcr.io/hvn-group/hvn-ai-mcp`, cổng 3000, health check `GET /healthz`.
- Giới hạn tài nguyên khởi điểm: 512 MB RAM; CPU 0,5 (staging) và 1 (production). Chỉnh theo load test.
- Không nối vào mạng Docker của ứng dụng khác; MCP không cần cơ sở dữ liệu.
- Biến môi trường: `MCP_ALLOWED_HOSTS` (đúng domain của ứng dụng), `MCP_REQUESTS_PER_MINUTE=600`, `MCP_MAX_CONCURRENT=50`; riêng production có `OPENAI_DOMAIN_TOKEN`.

**VPS:** đăng nhập GHCR một lần bằng token chỉ có quyền `read:packages` của tài khoản máy: `docker login ghcr.io`.

**Cấu hình trong GitHub, cho từng environment `staging` và `production`:**
- Secret `COOLIFY_TOKEN`: API token của Coolify, chỉ cấp hai quyền `deploy` (gọi deploy) và `read` (đọc trạng thái deployment); không cấp `read:sensitive`, `write` hay `root`. Token không qua xác minh 2 bước, nên chỉ lưu ở đây và đổi mỗi 6 tháng.
- Biến `COOLIFY_URL`, `COOLIFY_APP_UUID` (UUID của ứng dụng tương ứng), `MCP_BASE_URL` (ví dụ `https://staging-mcp.hvn.vn`).

## Deploy

Workflow `deploy`:
1. Mỗi lần merge vào `main`: build image `ghcr.io/hvn-group/hvn-ai-mcp:<sha>`, gắn thêm tag `staging`, gọi API Coolify deploy `hvn-mcp-staging` (`deploy/coolify-deploy.sh`), rồi chạy `deploy/smoke.sh`.
2. Đưa lên production: Actions > `deploy` > Run workflow, nhập `production_sha` là commit đã chạy tốt trên staging. Workflow gắn tag `production` cho image của commit đó, deploy `hvn-mcp-production` và chạy smoke test. Gói GitHub Team không có người duyệt bắt buộc cho repo riêng tư, nên nút bấm tay này là bước duyệt.

## Rollback

Chạy lại bước 2 ở trên với `production_sha` là commit cũ. Danh sách commit có image nằm trong Organization > Packages > `hvn-ai-mcp`.

## Log

- **Log ứng dụng** dạng JSON, mỗi dòng gồm thời điểm, kênh, mã trạng thái, độ trễ; với dòng gọi công cụ thì có thêm tên công cụ và số mục trả về. Không ghi IP và không ghi nội dung truy vấn. Xem trong Coolify > ứng dụng > Logs.
- **Proxy Traefik của Coolify** tắt access log (Servers > Proxy > Configuration không có cờ `--accesslog`). Proxy dùng chung cho mọi ứng dụng trên VPS; không bật lại khi chưa sửa chính sách quyền riêng tư. Kiểm tra: gửi request từ một IP đã biết rồi chạy `docker logs coolify-proxy --since 10m 2>&1 | grep <IP>` trên VPS, kết quả phải rỗng.

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
