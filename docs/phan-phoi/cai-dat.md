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

Chủ tổ chức (Owner) có thể cài Tech Advisor cho mọi thành viên mà không cần sao chép nội dung. Chọn một trong các cách sau.

### Cách 1: từ thư mục plugin của Anthropic (khi Tech Advisor đã được niêm yết)

Không cần GitHub. Plugin tự cập nhật khi HVN GROUP phát hành bản mới.

1. Mở **Organization settings** > **Plugins & skills** > tab **Inventory**.
2. Tìm **Tech Advisor**, mở menu cuối dòng > **Default access** > chọn **Installed by default**.

[Hiển thị sau khi Anthropic duyệt: link trang Tech Advisor trong thư mục plugin.]

### Cách 2: đồng bộ từ một repo GitHub chỉ chứa một file

Cách này cần **một tài khoản GitHub** của doanh nghiệp (gói miễn phí là đủ) để tạo một repo **riêng tư**. Repo chỉ chứa một file trỏ tới plugin của HVN GROUP, không chứa bản sao nội dung. Lý do: Claude chỉ đồng bộ marketplace của tổ chức từ repo riêng tư, còn plugin bên trong được phép trỏ tới repo công khai của HVN GROUP.

1. Trên GitHub, tạo repo **Private**, ví dụ `cong-ty-mau/claude-plugins`.
2. Thêm file `.claude-plugin/marketplace.json` với nội dung:

   ```json
   {
     "name": "hvn-tech-advisor",
     "owner": { "name": "Tên công ty của bạn" },
     "plugins": [
       {
         "name": "tech-advisor",
         "description": "Cố vấn công nghệ tiếng Việt do HVN GROUP phát hành",
         "source": {
           "source": "git-subdir",
           "url": "https://github.com/HVN-GROUP/hvn-ai-marketplace.git",
           "path": "plugins/tech-advisor"
         }
       }
     ]
   }
   ```

3. Trên claude.ai, mở **Organization settings** > **Plugins & skills** > **Add** > **Sync from GitHub**. Kết nối GitHub, cài **Claude GitHub App** cho repo vừa tạo, chọn repo rồi bấm **Create**.
4. Ở tab **Inventory**, đặt **Tech Advisor** là **Installed by default**.
5. **Cập nhật:** Claude không tự đồng bộ theo lịch. Khi HVN GROUP thông báo có bản mới, mở tab **Marketplaces** > menu của marketplace > **Re-sync**.

Thành viên không cần tài khoản GitHub; chỉ người thiết lập cần.

### Cách 3: từng thành viên tự thêm

Owner bật **User-created skills** trong **Organization settings** > **Plugins & skills** > **Policy**. Mỗi thành viên làm theo phần **Claude** ở trên.

### Claude Code cho đội kỹ thuật

Quản trị viên khai báo marketplace `HVN-GROUP/hvn-ai-marketplace` trong managed settings (`extraKnownMarketplaces`, `enabledPlugins` với `tech-advisor@hvn-marketplace`) và bật tự cập nhật. Claude Code trên máy nhân viên tự nhận bản mới.

Cần hỗ trợ: Service HVN GROUP, kythuat@hvn.vn.

## ChatGPT

[Hiển thị sau khi plugin được OpenAI duyệt: link plugin trong directory và gói ChatGPT hỗ trợ.]

HVN GROUP · hvn.vn
