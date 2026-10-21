---
title: "Dùng Claude Projects cho phòng Sales"
type: playbook
needs: [ung-dung-ai, quan-ly-khach-hang]
reviewed: 2026-10-21
review_sla_days: 60
sources:
  - https://support.claude.com/en/articles/9517075-what-are-projects
---

# Dùng Claude Projects cho phòng Sales

**Dành cho:** trưởng phòng và nhân viên kinh doanh của doanh nghiệp vừa và nhỏ.
**Kết quả:** một Project dùng chung giúp soạn email chào hàng, chuẩn bị cuộc gọi và tóm tắt cuộc họp khách hàng nhanh hơn.

## Bối cảnh

Nhân viên kinh doanh mất nhiều thời gian viết lại cùng một loại nội dung. Một Project chung giữ sẵn thông tin sản phẩm và giọng văn của công ty, nên mỗi người chỉ cần đưa thông tin về khách hàng.

## Các bước

1. Tạo Project `Sales – Trợ lý kinh doanh` theo hướng dẫn [Tạo và chia sẻ Project cho cả nhóm](./tao-va-chia-se-project.md).
2. Tải lên tài liệu nền: mô tả sản phẩm, câu hỏi thường gặp, các email mẫu hiệu quả nhất. **Không** tải lên danh sách khách hàng hay thông tin liên hệ cá nhân.
3. Dán hướng dẫn Project mẫu bên dưới và chỉnh theo công ty.
4. Thống nhất cả phòng dùng 3 prompt mẫu trong tuần đầu.
5. Cuối tuần, cùng xem lại câu trả lời chưa tốt và bổ sung hướng dẫn.

## Prompt mẫu

Hướng dẫn Project:

```text
Bạn là trợ lý kinh doanh của công ty chúng tôi. Luôn trả lời bằng tiếng Việt,
giọng chuyên nghiệp và thân thiện. Chỉ nêu tính năng có trong tài liệu sản phẩm.
Không đưa ra giá hay cam kết thời gian; nếu khách hỏi, đề nghị chuyển cho
nhân viên phụ trách.
```

Prompt dùng hằng ngày:

```text
Soạn email chào hàng gửi trưởng phòng nhân sự của một công ty sản xuất 200 người.
Nhu cầu đã biết: muốn số hóa quy trình nghỉ phép. Dưới 180 từ, kết thúc bằng
đề nghị một cuộc gọi 15 phút.
```

```text
Từ ghi chú cuộc gọi dưới đây, lập bảng: nhu cầu của khách, phản đối đã nêu,
bước tiếp theo và hạn chót. Sau đó soạn email cảm ơn và tóm tắt cuộc gọi.
```

## Kết quả mong đợi

Email và bản tóm tắt dùng được ngay sau khi chỉnh nhẹ, đồng nhất giọng văn trong cả phòng. Thời gian soạn mỗi email giảm rõ rệt sau 2 tuần.

## Nguồn

- https://support.claude.com/en/articles/9517075-what-are-projects
