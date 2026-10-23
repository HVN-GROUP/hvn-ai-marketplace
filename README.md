# HVN AI Plugin Marketplace

**Tech Advisor** là plugin cố vấn công nghệ tiếng Việt do HVN GROUP phát hành. Một plugin duy nhất giúp doanh nghiệp chọn giải pháp chuyển đổi số và dùng hiệu quả Claude, ChatGPT, Gemini, Google Workspace, Microsoft 365 cùng các giải pháp bảo mật. Mỗi chủ đề có lộ trình onboard 90 ngày.

## Cài đặt

- **claude.ai, Claude Desktop, Cowork:** Customize > Plugins > Add > Add marketplace, nhập `HVN-GROUP/hvn-ai-marketplace`, rồi cài **Tech Advisor**.
- **Claude Code:** `/plugin marketplace add HVN-GROUP/hvn-ai-marketplace`, rồi `/plugin install tech-advisor@hvn-marketplace`. Bật tự cập nhật trong `/plugin` > Marketplaces để luôn có nội dung mới.

Hướng dẫn chi tiết và cách nhận biết đúng marketplace của HVN: https://hvn.vn/ai-plugin

## Chủ đề

| Chủ đề | Nội dung |
|---|---|
| Tư vấn chuyển đổi số (`hvn-advisor`) | Tư vấn theo nhu cầu, chọn gói theo quy mô, danh mục 14 thương hiệu và 22 giải pháp trọn gói |
| Claude cho doanh nghiệp (`hvn-claude`) | Lộ trình 90 ngày, prompt tiếng Việt, Projects, quản trị Team, tuân thủ dữ liệu cá nhân |

Các chủ đề ChatGPT, Gemini, Google Workspace, Microsoft 365 và bảo mật được thêm vào cùng plugin khi đủ nội dung đã duyệt.

## Dành cho nhóm phát triển

Nội dung nguồn nằm trong `content/<chủ-đề>/` (mỗi chủ đề có `topic.yaml`); tên và mô tả plugin nằm trong `config/plugin.yaml`. Build gộp mọi chủ đề vào **một plugin duy nhất** `plugins/tech-advisor/`, nên tên skill phải khác nhau giữa các chủ đề. Mã tài liệu và `utm_campaign` vẫn theo chủ đề.

Thêm sản phẩm hoặc đối tác mới: thêm dòng vào `catalog/products.yaml`; chỉ thêm chủ đề mới khi cần hướng dẫn chuyên sâu. Không tạo plugin mới.

Các thư mục `plugins/` và `.claude-plugin/` do `npm run build` sinh ra; không sửa tay. Build tự tăng số phiên bản (bản vá) khi nội dung plugin thay đổi so với bản build trước; marketplace tổ chức trên claude.ai dựa vào số phiên bản này để tự đồng bộ.

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
