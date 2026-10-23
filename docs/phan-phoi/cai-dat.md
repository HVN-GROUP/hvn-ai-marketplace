# Cài đặt plugin AI của HVN GROUP

> Nguồn nội dung cho trang `hvn.vn/ai-plugin`. Marketing đăng sau khi CMO duyệt. Nút "Sao chép lệnh cài" gắn sự kiện GA4 `copy_install_command`.

**Tech Advisor** là plugin cố vấn công nghệ tiếng Việt do HVN GROUP phát hành. Chỉ cần cài một plugin để được tư vấn chọn giải pháp và hướng dẫn dùng hiệu quả Claude, ChatGPT, Gemini, Google Workspace, Microsoft 365 và các giải pháp bảo mật. Mỗi chủ đề có **lộ trình onboard 90 ngày** và hướng dẫn từng bước bằng tiếng Việt.

## Cách nhận biết đúng HVN GROUP

- Tên marketplace chính thức duy nhất: **`HVN-GROUP/hvn-ai-marketplace`**.
- Tổ chức GitHub `HVN-GROUP` có huy hiệu domain đã xác minh **hvn.vn**.
- HVN GROUP **không bao giờ** gửi tên marketplace qua Zalo hay tin nhắn. Mọi hướng dẫn chỉ nằm trên trang này.
- Nếu nghi ngờ, liên hệ kythuat@hvn.vn hoặc 024.9999.7777.

## Claude (claude.ai, Claude Desktop, Cowork)

1. Mở **Customize** > **Plugins** > **Add** > **Add marketplace**.
2. Nhập `HVN-GROUP/hvn-ai-marketplace` [Sao chép].
3. Cài **Tech Advisor** (nhà phát hành: HVN GROUP).
4. Hỏi Claude: "Cho tôi lộ trình 90 ngày dùng Claude hiệu quả".

Gói Claude hỗ trợ: [điền sau khi chạy spike (a) — Free/Pro/Team/Enterprise].

## Claude Code

```text
/plugin marketplace add HVN-GROUP/hvn-ai-marketplace
/plugin install tech-advisor@hvn-marketplace
```

Bật **tự cập nhật** trong `/plugin` > Marketplaces. Tự cập nhật mặc định tắt với marketplace bên thứ ba; nếu không bật, bạn sẽ không nhận được nội dung mới.

## Dành cho quản trị viên Claude Team và Enterprise

- Nếu thành viên không thấy mục **Add marketplace**: Owner bật chính sách **User-created skills** trong cài đặt tổ chức.
- Muốn cài sẵn cho cả tổ chức: tạo bản sao (mirror) của repo vào một repo **riêng tư** của công ty rồi dùng **Sync from GitHub**, hoặc tải gói zip lên. Đồng bộ tổ chức chỉ nhận repo riêng tư.
- Cần hỗ trợ: Service HVN GROUP, kythuat@hvn.vn.

## ChatGPT

[Hiển thị sau khi plugin được OpenAI duyệt: link plugin trong directory và gói ChatGPT hỗ trợ.]

HVN GROUP · hvn.vn
