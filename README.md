# HVN AI Plugin Marketplace

Plugin hướng dẫn tiếng Việt của HVN GROUP giúp doanh nghiệp dùng hiệu quả Claude, ChatGPT, Gemini, Google Workspace, Microsoft 365 và các giải pháp bảo mật. Mỗi plugin có lộ trình onboard 90 ngày và gợi ý giải pháp liên quan từ HVN GROUP.

## Cài đặt

- **claude.ai, Claude Desktop, Cowork:** Customize > Plugins > Add > Add marketplace, nhập `HVN-GROUP/hvn-ai-marketplace`, rồi cài plugin cần dùng.
- **Claude Code:** `/plugin marketplace add HVN-GROUP/hvn-ai-marketplace`, rồi `/plugin install hvn-advisor@hvn-marketplace`. Bật tự cập nhật trong `/plugin` > Marketplaces để luôn có nội dung mới.

Hướng dẫn chi tiết và cách nhận biết đúng marketplace của HVN: https://hvn.vn/ai-plugin

## Plugin

| Plugin | Nội dung |
|---|---|
| `hvn-advisor` | Tư vấn giải pháp, danh mục 14 thương hiệu và 22 giải pháp trọn gói |
| `hvn-claude` | Lộ trình 90 ngày, prompt tiếng Việt, Projects, quản trị Team, tuân thủ dữ liệu cá nhân |

Các plugin `hvn-chatgpt`, `hvn-gemini`, `hvn-google-workspace`, `hvn-microsoft-365`, `hvn-security` sẽ được phát hành khi đủ nội dung đã duyệt.

## Dành cho nhóm phát triển

Nội dung nguồn nằm trong `content/`. Các thư mục `plugins/` và `.claude-plugin/` do `npm run build` sinh ra; không sửa tay. Build tự tăng số phiên bản (bản vá) của plugin nào có nội dung thay đổi so với bản build trước; marketplace tổ chức trên claude.ai dựa vào số phiên bản này để tự đồng bộ.

```bash
npm ci
npm run build      # sinh plugins/, .claude-plugin/marketplace.json và chỉ mục nội dung cho MCP
npm run check      # schema, PII, link, lệnh nguy hiểm, whitelist file, drift, UTM
npm test
```

- MCP server cho ChatGPT: `npm start` (cổng 3000), vận hành xem `docs/van-hanh-mcp.md`.
- Quy trình soạn và duyệt nội dung: xem `docs/` và skill `hvn-content-draft` trong repo nội bộ.
- Thiết lập repo lần đầu: xem `docs/thiet-lap-repo.md`.

## Giấy phép

- Mã nguồn: MIT (`LICENSE`).
- Nội dung hướng dẫn: © HVN GROUP (`LICENSE-CONTENT.md`).

Hỗ trợ: kythuat@hvn.vn · Hotline 024.9999.7777

HVN GROUP · hvn.vn
