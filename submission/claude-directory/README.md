# Hồ sơ nộp Tech Advisor lên thư mục plugin của Anthropic

Niêm yết trong thư mục plugin của Anthropic (Anthropic directory) cho phép mọi tổ chức Claude Team và Enterprise cài Tech Advisor cho toàn bộ thành viên mà không cần GitHub. Mỗi lần HVN GROUP merge vào `main`, plugin tự cập nhật cho người dùng.

Tài liệu gốc:
- [Publish to the directory](https://claude.com/docs/directory/publish)
- [Submit your plugin](https://claude.com/docs/plugins/submit)
- [Plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist)
- [Anthropic Software Directory Policy](https://support.claude.com/en/articles/13145358-anthropic-software-directory-policy)

## Việc cần xong trước khi nộp

| # | Việc | Người làm |
|---|---|---|
| 1 | Đăng trang chính sách quyền riêng tư tại `https://hvn.vn/chinh-sach-quyen-rieng-tu-ai-plugin` (bản nháp: `docs/phap-ly/chinh-sach-quyen-rieng-tu-ai-plugin.md`). README của plugin đã dẫn tới trang này, nên trang phải mở được. | Marketing, CMO duyệt |
| 2 | Người nộp là **Owner** của tổ chức Claude của HVN GROUP (gói Team). | CEO |
| 3 | Trong tổ chức đó, kết nối GitHub của tài khoản có quyền push vào `HVN-GROUP/hvn-ai-marketplace` (ví dụ `hvngroup`). Cổng nộp kiểm tra quyền push trước khi tạo hồ sơ. | CEO |
| 4 | Người có quyền admin repo `HVN-GROUP/hvn-ai-marketplace` cài **GitHub push webhook** sau khi nộp, để bản mới được quét ngay khi mirror đẩy lên. | CEO |

## Điền form tại claude.ai/directory/manage

Chọn **Submit new** > **Plugin bundle**.

| Bước | Trường | Giá trị |
|---|---|---|
| Source | Repository | `HVN-GROUP/hvn-ai-marketplace` (repo công khai, mirror tự động từ repo staging) |
| Source | Plugin path | `plugins/tech-advisor` |
| Source | Branch or tag | Để trống (theo nhánh mặc định `main`) |
| Source | Validate | Bấm **Validate**; sửa mọi mục **Blocking** rồi **Re-validate** |
| Listing details | Tên, mô tả | Đọc từ `plugins/tech-advisor/.claude-plugin/plugin.json` và `README.md`; muốn sửa thì sửa `config/plugin.yaml` hoặc phần README trong `scripts/build.ts` |
| Data handling | Đọc hoặc lưu dữ liệu cá nhân | Không |
| Data handling | Gửi dữ liệu tới dịch vụ khác | Không. Plugin không có hook hay máy chủ MCP; chỉ có link tới website HVN GROUP mà người dùng tự bấm |
| Data handling | Thời gian lưu dữ liệu | Không lưu |
| Data handling | Dành cho người dưới 18 tuổi | Không (dành cho doanh nghiệp) |
| Compliance | Email liên hệ | `kythuat@hvn.vn` (hộp thư chung, không phụ thuộc một cá nhân) |
| Compliance | 4 cam kết | Chọn đủ 4 |
| Review and submit | How new versions reach the directory | **GitHub push webhook** |
| Review and submit | Auto-publish passing versions | Bật |

## Kết quả tự kiểm tra (23/10/2026)

| Yêu cầu | Kết quả |
|---|---|
| Thư mục plugin có `.claude-plugin/plugin.json` | Đạt |
| Một plugin mỗi hồ sơ | Đạt (marketplace chỉ có `tech-advisor`) |
| Không symlink, submodule, LFS; không `.DS_Store`, `Thumbs.db` | Đạt |
| Không có `.gitattributes` | Đạt |
| Repo dưới 50 MiB, dưới 10.000 tệp; mỗi tệp trong plugin dưới 256 KiB, plugin dưới 512 tệp | Đạt (repo khoảng 0,2 MiB, 126 tệp; plugin 44 tệp) |
| `name` chữ thường, số, gạch ngang | Đạt (`tech-advisor`) |
| Có `description`, `author`, `version`; tăng `version` mỗi lần phát hành | Đạt (build tự tăng bản vá khi nội dung đổi) |
| README ít nhất 40 từ | Đạt (khoảng 740 từ) |
| Có giấy phép | Đạt (`LICENSE` và trường `license`) |
| Chỉ có tệp văn bản | Đạt |
| Không chạy gói qua `npx`/`uvx`, không có khóa bí mật, không hook, không MCP | Đạt |
| README mô tả mọi thứ plugin chạy, gửi hoặc tải | Đạt (mục "Plugin làm gì và không làm gì") |
| `claude plugin validate` | Đạt |

Lệnh kiểm tra lại: `npm run build && npm run check && npx -y @anthropic-ai/claude-code@2.1.306 plugin validate plugins/tech-advisor`.

## Rủi ro khi duyệt và cách xử lý

1. **Tên chung chung.** Theo checklist, tên chỉ gồm từ thông dụng có thể bị giữ lại chờ người duyệt. Nếu tổ chức khác đã dùng tên này, hồ sơ sẽ bị chặn với thông báo **Name is taken**. Bấm **Validate** trước sẽ biết ngay. Nếu bị chặn hoặc bị giữ, chọn tên riêng hơn, chỉ cần sửa `name` và `displayName` trong `config/plugin.yaml`. Lệnh cài, trang cài đặt và file mẫu cho tổ chức sẽ đổi theo, vì test kiểm tra file mẫu khớp với tên plugin.
2. **Chính sách §4C (phần mềm tồn tại chủ yếu để quảng cáo).** Plugin giới thiệu dịch vụ của HVN GROUP, nên người duyệt sẽ xem tỷ lệ giữa hướng dẫn và quảng bá. Các biện pháp đã có:
   - Giọng cố vấn độc lập.
   - Mỗi câu trả lời chỉ giới thiệu một mục phù hợp nhất, trong 1–2 câu.
   - Không nêu giá, không dùng lời lẽ quảng cáo.
   - README công bố rõ HVN GROUP là đối tác phân phối và triển khai.

   Hiện plugin mới có 10 bài, phần lớn thuộc chủ đề tư vấn và mua hàng. Nên **Validate ngay** để biết vấn đề về tên, nhưng chỉ **Submit for review** khi các chủ đề hướng dẫn (Claude, Google Workspace, Microsoft 365…) đã có thêm bài, để plugin thể hiện rõ là bộ hướng dẫn.
3. **Mọi bản mới đều được quét lại.** Bản nào không đạt thì danh sách vẫn giữ bản đang chạy. Theo dõi tab **Versions** trong cổng nộp sau mỗi lần merge.

## Sau khi được niêm yết

- Thay dòng chờ ở mục "Cách 1" trong `docs/phan-phoi/cai-dat.md` bằng link trang Tech Advisor trong thư mục.
- Báo các khách đang dùng cách 2 (repo một file) chuyển sang cách 1: gỡ marketplace cũ ở tab **Marketplaces**, rồi đặt Tech Advisor từ thư mục là **Installed by default**.

HVN GROUP · hvn.vn
