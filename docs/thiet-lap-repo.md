# Thiết lập repo (làm một lần)

Owner của tổ chức GitHub `HVN-GROUP` (gói Team) thực hiện các bước dưới đây.

## Nhóm (team) GitHub dùng trong CODEOWNERS

| Team | Thành viên |
|---|---|
| `@HVN-GROUP/hvn-ai-tech` | Developer (#Giant) phụ trách dự án |
| `@HVN-GROUP/hvn-ai-content` | 1 biên tập viên Content (#Valkyrie) và 1 kỹ thuật viên Service (#Witch) |
| `@HVN-GROUP/hvn-security` | Người được HVN Security chỉ định |

## `HVN-GROUP/hvn-ai-marketplace-staging` (riêng tư)

- **Ruleset cho `main`:**
  - Bắt buộc PR, check `check` (workflow `ci`) phải xanh, 1 approval của CODEOWNERS.
  - Chỉ cho squash merge; bật merge queue nếu gói hiện tại có.
  - Hủy approval khi có commit mới; bypass list để trống, kể cả admin.
- **Environment `public-mirror`:** chỉ nhánh `main` được dùng. Thêm secret `PUBLIC_MIRROR_DEPLOY_KEY`, là khóa riêng của deploy key.
- **GitHub Packages:** trong Organization settings > Packages, cho phép thành viên tạo package riêng tư. Lần đầu workflow `deploy` push `ghcr.io/hvn-group/hvn-ai-mcp`, vào package đó > Package settings: ở Manage Actions access thêm repo staging với quyền Write nếu chưa có; ở Manage access thêm tài khoản máy mà VPS Coolify dùng để kéo image, quyền Read.
- **Environment `staging` và `production`** (dùng cho deploy MCP): mục Deployment branches chỉ cho `main`. Gói Team không có người duyệt bắt buộc cho repo riêng tư, nên job production chỉ chạy khi bấm tay Run workflow (xem `docs/van-hanh-mcp.md`). Secret và biến của hai environment ghi trong tài liệu đó.

## `HVN-GROUP/hvn-ai-marketplace` (công khai)

- **Deploy key:** thêm khóa công khai của deploy key, có quyền ghi. Chỉ workflow `mirror` dùng khóa này.
- **Branch protection cho `main`:** chỉ deploy key được push, không ai push tay.
- **Tắt** Issues, Discussions và Wiki; trỏ hỗ trợ về `kythuat@hvn.vn`.

## Tạo deploy key

```bash
ssh-keygen -t ed25519 -N '' -C hvn-ai-marketplace-mirror -f mirror_key
# mirror_key.pub -> Deploy keys của repo công khai (chọn Allow write access)
# mirror_key     -> secret PUBLIC_MIRROR_DEPLOY_KEY trong environment public-mirror của repo staging
rm mirror_key mirror_key.pub
```
