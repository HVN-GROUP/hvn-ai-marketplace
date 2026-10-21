# Thiết lập repo (làm một lần)

Quản trị viên GitHub của HVN GROUP thực hiện các bước dưới đây.

## Nhóm (team) GitHub dùng trong CODEOWNERS

| Team | Thành viên |
|---|---|
| `@hvngroup/hvn-ai-tech` | Developer (#Giant) phụ trách dự án |
| `@hvngroup/hvn-ai-content` | 1 biên tập viên Content (#Valkyrie) và 1 kỹ thuật viên Service (#Witch) |
| `@hvngroup/hvn-security` | Người được HVN Security chỉ định |

## `hvngroup/hvn-ai-marketplace-staging` (riêng tư)

- **Branch protection cho `main`:**
  - Bắt buộc PR, check `ci / check` phải xanh, 1 approval của CODEOWNERS.
  - Chỉ cho squash merge; bật merge queue.
  - Hủy approval khi có commit mới; áp dụng cho cả admin.
- **Environment `public-mirror`:** chỉ nhánh `main` được dùng. Thêm secret `PUBLIC_MIRROR_DEPLOY_KEY`, là khóa riêng của deploy key.
- **GitHub Packages:** trong Organization settings > Packages, cho phép thành viên tạo package riêng tư. Lần đầu workflow `deploy` push `ghcr.io/hvngroup/hvn-ai-mcp`, vào package đó > Package settings > Manage Actions access và thêm repo staging với quyền Write nếu chưa có.
- **Environment `staging` và `production`** (dùng cho deploy MCP): mục Deployment branches chỉ cho `main`. Riêng `production` bắt buộc 1 người duyệt.

## `hvngroup/hvn-ai-marketplace` (công khai)

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
