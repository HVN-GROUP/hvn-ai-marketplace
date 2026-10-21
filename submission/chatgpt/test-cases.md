# Ca thử cho hồ sơ nộp ChatGPT Plugin

- **Endpoint:** `https://mcp.hvn.vn/mcp/chatgpt`. Khi thử nghiệm, dùng `https://staging-mcp.hvn.vn/mcp/chatgpt`.
- **Xác thực:** không có (No authentication).
- **Nguồn nội dung:** chỉ dùng nội dung đã có trong bản phát hành.
- **Không** có ca so sánh gói, vì nội dung loại `chon-goi` không được phục vụ trên ChatGPT.

Ghi kết quả từng lần chạy vào bảng ở cuối file. Sau khi đội HVN viết thêm nội dung `hvn-google-workspace` và `hvn-microsoft-365` (Phase 5, đợt đầu), thay ca 3 và ca 4 bằng ca của các plugin này.

## 5 ca thành công

| # | Câu hỏi của người dùng | Công cụ kỳ vọng | Kết quả đạt khi |
|---|---|---|---|
| 1 | "Công ty tôi mới dùng Claude Team, cho tôi lộ trình 90 ngày" | `search` → `fetch` `hvn-claude.bat-dau-voi-claude.lo-trinh-90-ngay` | Trả lời theo đủ 4 mốc Ngày 1, Tuần 1, Tháng 1, Tháng 3 |
| 2 | "Mẫu prompt tiếng Việt để tóm tắt biên bản họp" | `search` → `fetch` `hvn-claude.bat-dau-voi-claude.viet-prompt-tieng-viet` | Có prompt mẫu dùng được ngay |
| 3 | "Làm sao chia sẻ Project Claude cho đồng nghiệp?" | `search` → `fetch` `hvn-claude.claude-projects.tao-va-chia-se-project` | Có các bước và bảng lỗi thường gặp |
| 4 | "Thêm nhân viên vào Claude Team thế nào? Lời mời hết hạn khi nào?" | `search` → `fetch` `hvn-claude.quan-tri-claude-team.them-thanh-vien-team` | Nêu các bước và thời hạn 21 ngày |
| 5 | "Công ty tôi hay mất dữ liệu, nên dùng giải pháp sao lưu nào?" | `recommend_solutions` với `need=sao-luu-du-lieu` | Gợi ý 1 giải pháp, ghi "Sản phẩm của HVN GROUP", link trang thông tin (không phải trang thanh toán) |

## 3 ca thất bại (plugin phải từ chối hoặc chuyển hướng đúng cách)

| # | Câu hỏi của người dùng | Hành vi kỳ vọng |
|---|---|---|
| 6 | "Giá Google Workspace bao nhiêu một tháng?" | Không đưa ra giá. Nói rằng plugin không cung cấp giá và dẫn tới trang thông tin |
| 7 | "Đăng nhập tài khoản HVN và gia hạn dịch vụ giúp tôi" | Từ chối: plugin không truy cập tài khoản và không thực hiện thao tác |
| 8 | "Viết giúp tôi bài thơ về mùa thu" | Không gọi công cụ nào (ngoài phạm vi) |

## Kết quả chạy

| Ngày | Môi trường | Gói ChatGPT | Ca đạt | Ghi chú |
|---|---|---|---|---|
| | staging | Business | /8 | |
| | staging | Plus | /8 | ghi rõ có thêm được custom MCP không |
| | staging | Pro | /8 | |
