## Nội dung thay đổi

<!-- plugin, skill, các item thêm/sửa -->

## Checklist duyệt nội dung

- [ ] Đúng kỹ thuật: đã đối chiếu từng link trong `sources`.
- [ ] Không có tên, domain, email, số điện thoại hay IP của khách hàng thật; ví dụ chỉ dùng domain mẫu.
- [ ] Không dùng dữ liệu WHMCS (ticket, khách hàng, đơn hàng).
- [ ] Không có giá, giá gốc vendor, khuyến mãi hay thông tin nội bộ.
- [ ] Không có lệnh tải và chạy script từ xa; mọi lệnh đọc hiểu được và an toàn.
- [ ] Giọng văn theo Brand Guideline HVN; `needs` hợp lý.
- [ ] Loại `lo-trinh`: mọi bước dẫn tới item đã có.
- [ ] Loại `tuan-thu`: HVN Security đã approve.

## Checklist kỹ thuật (khi PR đổi mã, cấu hình, catalog)

- [ ] `npm run build && npm run check && npm test` đạt cục bộ.
- [ ] URL mới trong catalog là trang thông tin đang tồn tại (không phải giỏ hàng).
