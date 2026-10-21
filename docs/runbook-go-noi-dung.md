# Runbook: gỡ nội dung khẩn cấp

**Áp dụng khi:** nội dung sai nghiêm trọng, chứa thông tin không được phép, hoặc có link độc hại.
**SLA:** xử lý xong trong 4 giờ làm việc kể từ khi phát hiện.
**Chịu trách nhiệm:** trưởng nhóm kỹ thuật dự án, cùng HVN Security nếu có dữ liệu nhạy cảm.

## Các bước

1. **Gỡ trên staging.** Tạo PR revert commit chứa nội dung lỗi trong `hvn-ai-marketplace-staging`, chờ CI xanh rồi merge. Workflow `mirror` tự đẩy thay đổi sang repo công khai sau vài phút.
2. **Cập nhật MCP server.** Workflow `deploy` tự build image mới và triển khai lên staging. Người duyệt phê duyệt bước triển khai production trong environment `production`. Xác nhận bằng cách gọi `fetch` với mã tài liệu đã gỡ; kết quả phải là "không tìm thấy".
3. **Nếu thông tin không được phép đã lên repo công khai:**
   - Liên hệ GitHub Support để xóa commit khỏi cache và ref.
   - Báo HVN Security để đánh giá theo Quy định 01-01/11/2024/QyĐ.
4. **Thông báo.** Cập nhật trang `hvn.vn/ai-plugin` và nhắc người dùng Claude Code chạy `/plugin marketplace update hvn-marketplace`.
5. **Ghi nhận.** Mở issue mô tả nguyên nhân và biện pháp ngăn tái diễn, ví dụ thêm luật mới vào `scripts/check.ts`.
