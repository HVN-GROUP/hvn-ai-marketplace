# Đo lường plugin AI bằng GA4

Đo lường **không** kết nối WHMCS (Validation Log, Session 2). Mọi chỉ số lấy từ GA4 trên website thương hiệu, log của MCP server và số liệu lưu lượng GitHub.

## Chuẩn bị trên website (Marketing hoặc HVN Digital)

1. Xác nhận GA4 đã gắn trên mọi domain mà catalog trỏ tới: hvn.vn, gcs.vn, mso.vn, zhs.vn, lic.vn, cer.vn, emx.vn, cke.vn, tdo.vn, web.net.vn, fdm.vn, dxt.vn, etg.vn, asx.vn, uix.vn.
2. Đánh dấu là **key event** các sự kiện chuyển đổi sẵn có: gửi form liên hệ, bấm "Mua ngay", bấm hotline, bấm Zalo.
3. Trên `hvn.vn/ai-plugin`: thêm sự kiện `copy_install_command`, kèm tham số `platform` (claude, claude-code, chatgpt).

## Quy ước UTM

Nguồn duy nhất của quy ước là `config/channels.yaml`.

| Nguồn | utm_source | utm_medium | utm_campaign | utm_content |
|---|---|---|---|---|
| Plugin Claude | `claude` | `ai-plugin` | tên plugin | `plugin.skill.item` |
| ChatGPT, công cụ `fetch` | `chatgpt` | `ai-plugin` | tên plugin của tài liệu | mã tài liệu |
| ChatGPT, công cụ `recommend_solutions` | `chatgpt` | `ai-plugin` | `hvn-advisor` | `recommend` |
| Email WHMCS | `email` | `whmcs` | `ai-plugin-onboarding` | nhóm sản phẩm |
| Zalo OA | `zalo` | `zalo-oa` | `ai-plugin-onboarding` | nhóm sản phẩm |

## Báo cáo GA4 Exploration "Plugin AI"

- **Bộ lọc:** session medium khớp chính xác `ai-plugin`.
- **Chiều:** session source, session campaign, session manual ad content.
- **Chỉ số:** sessions, key events, tỷ lệ key event.
- **Chia sẻ** cho CEO, CMO và COO.

## Chỉ số 90 ngày

| Chỉ số | Nguồn | Công thức |
|---|---|---|
| Lượt cài (đại diện) | GA4 `copy_install_command`; artifact `github-traffic` hằng tuần | Số người dùng duy nhất bấm nút cài; số clone duy nhất theo tuần |
| CTR ChatGPT | Log MCP (dòng `tool=recommend_solutions` có `items>0`), kết hợp GA4 với `utm_source=chatgpt` và `utm_campaign=hvn-advisor` | Số phiên ÷ số lần gọi có ít nhất 1 mục |
| Click Claude | GA4 `utm_source=claude` | Tổng phiên theo plugin và nội dung. Không tính CTR vì Claude không gửi số lần hiển thị về HVN GROUP. |
| Chuyển đổi trên website | GA4 key events trong các phiên `utm_medium=ai-plugin` | Số key event và tỷ lệ chuyển đổi theo plugin |
| Lượt mở lộ trình onboard | GA4 phiên có `utm_content` là item `lo-trinh`; log MCP `fetch` cho item `lo-trinh` | Số phiên và số lần fetch theo plugin |

## Giới hạn

- UTM có thể bị giả mạo, nên số liệu chỉ dùng làm chỉ báo, không dùng làm căn cứ thưởng.
- Không đo doanh thu và đơn hàng trong WHMCS. Muốn đo cần lập plan riêng.
