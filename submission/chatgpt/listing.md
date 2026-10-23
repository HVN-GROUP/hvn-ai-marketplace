# Thông tin listing ChatGPT Plugin (bản nháp)

Đã đối chiếu với quy định trong `plans/reports/researcher-261021-1130-chatgpt-apps-mcp-whmcs.md` §2 của repo nội bộ:
- Không nhắc giá, gói đăng ký, dùng thử hay khuyến mãi.
- Không dùng ngôn ngữ quảng cáo.
- Không ám chỉ được OpenAI xây dựng hay bảo trợ.

| Trường | Giá trị |
|---|---|
| Tên (`displayName`, tối đa 30 ký tự) | HVN GROUP |
| Nhà phát hành (`developerName`) | HVN GROUP JOINT STOCK COMPANY (CEO chốt ngày 23/10/2026); phải trùng tên pháp nhân đã xác minh trên OpenAI |
| Mô tả ngắn (`shortDescription`, tối đa 30 ký tự) | Hướng dẫn số cho doanh nghiệp |
| Mô tả | Tra cứu hướng dẫn từng bước, prompt mẫu, lộ trình onboard 90 ngày và lưu ý tuân thủ bảo vệ dữ liệu cá nhân, do chuyên gia HVN GROUP biên soạn và duyệt. Khi người dùng hỏi nên chọn giải pháp nào, plugin gợi ý giải pháp phù hợp của HVN GROUP kèm link trang thông tin. |
| Danh mục | Productivity |
| Quốc gia phát hành | Việt Nam (xác nhận có trong danh sách khi nộp) |
| Commerce | `false` |
| Website | https://hvn.vn/ai-plugin |
| Hỗ trợ | kythuat@hvn.vn |
| Chính sách quyền riêng tư | https://hvn.vn/chinh-sach-quyen-rieng-tu-ai-plugin |
| Điều khoản | https://hvn.vn/dieu-khoan-ai-plugin |
| Icon và logo | `assets/icon.png` (512×512, logo trắng trên nền #EA4445) và `assets/logo.png` (1024×1024, logo màu trên nền trắng) |
| Video demo | 2–3 phút, Marketing (#Minion) sản xuất, chạy lần lượt ca 1, 5 và 6 trong `test-cases.md` |

## Release notes (phiên bản đầu)

Phát hành lần đầu. Gồm 3 công cụ chỉ đọc:
- `search`: tìm hướng dẫn.
- `fetch`: đọc toàn văn hướng dẫn.
- `recommend_solutions`: gợi ý giải pháp theo nhu cầu.

Không yêu cầu đăng nhập, không thu thập dữ liệu cá nhân.

## Gói ZIP để nộp

Nguồn của gói nằm trong `submission/chatgpt/plugin/`:

- `plugin.json`: thông tin plugin; các trường hiển thị nằm trong `extensions.com.openai.interface`.
- `skills/huong-dan-hvn/SKILL.md`: skill bắt buộc phải có trong gói; hướng dẫn ChatGPT dùng `search`, `fetch` và chỉ gọi `recommend_solutions` khi người dùng hỏi nên chọn giải pháp nào.
- `assets/`: icon và logo.

MCP server không khai báo trong gói; URL `https://mcp.hvn.vn/mcp/chatgpt` được kết nối ở bước MCPs > Connect trên trang nộp hồ sơ.

```bash
npm run package:chatgpt -- --check   # chỉ kiểm tra theo luật validation của OpenAI
npm run package:chatgpt              # kiểm tra rồi tạo release/hvn-group-chatgpt.zip
```

CI chạy bước kiểm tra trên mọi PR. Sửa `plugin.json` sau khi đã phát hành thì tăng `version` và nộp lại để OpenAI duyệt.
