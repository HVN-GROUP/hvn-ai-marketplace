# Khối giới thiệu plugin trong email WHMCS và kịch bản Zalo OA

> **Phạm vi WHMCS:** admin **sửa tay** mẫu email trong giao diện quản trị. Không có tích hợp dữ liệu (Validation Log, Session 2).
> **Duyệt:** CMO duyệt nội dung trước khi áp dụng.
> **Không** bao giờ đặt chuỗi `owner/repo` trong email hay tin nhắn. Chỉ link tới `hvn.vn/ai-plugin`.

## Quy trình sửa mẫu email (admin WHMCS)

1. Chụp lại nội dung hiện tại của từng mẫu sẽ sửa (email chào mừng sản phẩm và email nhắc gia hạn của các nhóm bên dưới), lưu trên Drive để khôi phục khi cần.
2. Chèn khối HTML tương ứng vào cuối thân email, trước chữ ký.
3. Gửi thử từng mẫu, cho từng nhóm sản phẩm, tới hộp thư nội bộ. Kiểm tra hiển thị và kiểm tra phiên có `utm_campaign=ai-plugin-onboarding` trên GA4 Realtime.
4. Nếu lỗi, khôi phục mẫu từ bản đã chụp.

## Link dùng chung

```text
https://hvn.vn/ai-plugin?utm_source=email&utm_medium=whmcs&utm_campaign=ai-plugin-onboarding&utm_content=<nhom>
```

Giá trị `<nhom>`: `claude`, `google-workspace`, `microsoft-365`, `bao-mat`. Mọi giá trị phải khớp `^[a-z0-9.-]{1,64}$`.

## Khối email theo nhóm sản phẩm

Mọi khối đều dẫn tới cùng một plugin **Tech Advisor**; chỉ tiêu đề và lộ trình nhắc tới đổi theo nhóm sản phẩm.

| Nhóm sản phẩm | Tiêu đề khối | Chủ đề trong Tech Advisor |
|---|---|---|
| Claude | Lộ trình 90 ngày dùng Claude hiệu quả | Claude cho doanh nghiệp |
| Google Workspace | Lộ trình 90 ngày dùng Google Workspace hiệu quả | Google Workspace, Gemini *(bật khi chủ đề phát hành)* |
| Microsoft 365 | Lộ trình 90 ngày dùng Microsoft 365 hiệu quả | Microsoft 365 *(bật khi chủ đề phát hành)* |
| SSL, Acronis, Kaspersky, dịch vụ HVN Security | Lộ trình 90 ngày bảo vệ dữ liệu doanh nghiệp | Bảo mật *(bật khi chủ đề phát hành)* |

Mẫu khối (nhóm Claude):

```html
<div style="border-left:4px solid #EA4445;padding:12px 16px;margin:24px 0;font-family:Inter,Roboto,Arial,sans-serif;color:#333333">
  <p style="margin:0 0 8px;font-weight:600">Lộ trình 90 ngày dùng Claude hiệu quả</p>
  <p style="margin:0 0 8px">Cài plugin Tech Advisor do HVN GROUP phát hành để nhận hướng dẫn tiếng Việt theo từng mốc: Ngày 1, Tuần 1, Tháng 1, Tháng 3, ngay trong Claude.</p>
  <a href="https://hvn.vn/ai-plugin?utm_source=email&amp;utm_medium=whmcs&amp;utm_campaign=ai-plugin-onboarding&amp;utm_content=claude" style="color:#EA4445;font-weight:600">Xem hướng dẫn cài đặt</a>
</div>
```

Với ChatGPT: chỉ thêm nhắc tới plugin ChatGPT **sau khi** OpenAI duyệt.

## Kịch bản broadcast Zalo OA

Gửi theo từng tập khách hàng đang dùng nhóm sản phẩm tương ứng.

```text
[HVN GROUP] Dùng Claude hiệu quả hơn với lộ trình 90 ngày
Plugin Tech Advisor do HVN GROUP phát hành hướng dẫn bằng tiếng Việt từng bước: thiết lập tuần đầu,
Projects cho từng phòng ban, quản trị thành viên và lưu ý bảo vệ dữ liệu cá nhân.
Xem cách cài: https://hvn.vn/ai-plugin?utm_source=zalo&utm_medium=zalo-oa&utm_campaign=ai-plugin-onboarding&utm_content=claude
Hỗ trợ: 024.9999.7777
```

Kênh `zalo` (`utm_source=zalo`, `utm_medium=zalo-oa`) đã khai báo trong `config/channels.yaml`.
