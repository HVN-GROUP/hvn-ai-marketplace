---
title: "Viết prompt tiếng Việt để Claude trả lời đúng ý"
type: playbook
needs: [ung-dung-ai, dao-tao-chuyen-doi-so]
reviewed: 2026-10-21
review_sla_days: 60
sources:
  - https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview
---

# Viết prompt tiếng Việt để Claude trả lời đúng ý

**Dành cho:** mọi nhân viên mới dùng Claude.
**Kết quả:** câu trả lời đúng mục đích ngay từ lần hỏi đầu, ít phải hỏi lại.

## Bối cảnh

Claude hiểu tiếng Việt tốt, nhưng câu hỏi ngắn và thiếu bối cảnh sẽ cho câu trả lời chung chung. Cách khắc phục là nói rõ vai trò, bối cảnh, việc cần làm và định dạng mong muốn.

## Các bước

1. **Vai trò:** cho Claude biết nó đóng vai ai, ví dụ "Bạn là chuyên viên chăm sóc khách hàng".
2. **Bối cảnh:** nêu ai đọc kết quả, mục đích là gì, có ràng buộc nào.
3. **Nhiệm vụ:** dùng động từ rõ ràng: soạn, tóm tắt, so sánh, liệt kê.
4. **Định dạng:** nói rõ độ dài, dạng bảng hay gạch đầu dòng, giọng văn.
5. **Ví dụ:** nếu có mẫu tốt, dán vào và yêu cầu làm theo phong cách đó.
6. **Lặp lại:** nếu chưa đúng ý, nói cụ thể điều cần sửa thay vì hỏi lại từ đầu.

## Prompt mẫu

```text
Bạn là chuyên viên chăm sóc khách hàng của một công ty phần mềm.
Bối cảnh: khách hàng phàn nàn email xác nhận đơn hàng đến chậm 2 ngày.
Nhiệm vụ: soạn email phản hồi xin lỗi và nêu hướng xử lý.
Định dạng: dưới 150 từ, giọng lịch sự, có tiêu đề email.
```

```text
Tóm tắt biên bản họp dưới đây thành: (1) 3 quyết định chính,
(2) bảng việc cần làm gồm người phụ trách và hạn chót,
(3) các câu hỏi còn bỏ ngỏ. Chỉ dùng thông tin có trong biên bản.
```

## Kết quả mong đợi

Câu trả lời đúng định dạng, đúng giọng văn và không cần chỉnh sửa nhiều. Nếu Claude thiếu thông tin, nó sẽ hỏi lại thay vì tự đoán.

## Nguồn

- https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview
