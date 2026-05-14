---
name: docs-dev
description: Vận hành Docusaurus site — start dev server, build production, type-check, clear cache, kiểm broken links. Dùng khi user nói "chạy docs", "build docs", "kiểm site lỗi gì", "preview", hoặc trước khi commit thay đổi lớn.
---

# docs-dev — Vận hành Docusaurus

## Lệnh chính

| Mục đích | Lệnh | Ghi chú |
| --- | --- | --- |
| Cài deps | `pnpm install` | Repo dùng pnpm — README ghi `yarn` là lỗi, lock file là `pnpm-lock.yaml` |
| Dev server | `pnpm start` | Mở `http://localhost:3000`, hot reload |
| Build production | `pnpm build` | Output ra `./build/` — kiểm trước khi deploy |
| Type-check | `pnpm typecheck` | Kiểm `src/` và `docusaurus.config.ts` |
| Clear cache | `pnpm clear` | Xoá `.docusaurus/` khi build báo lỗi lạ |
| Serve build | `pnpm serve` | Test bản build static |

## Quy tắc khi chạy dev server

- **Dev server chặn terminal** → khi cần chạy lâu, dùng `run_in_background: true`. Khi xong việc, **kill background process** bằng `KillShell`.
- Đừng chạy `pnpm start` nếu chỉ cần verify markdown — `pnpm build` đủ và nhanh hơn cho CI-style check.
- Nếu port 3000 bận → Docusaurus tự chuyển sang 3001 (đọc output để biết URL thật).

## Cảnh báo cần lưu ý (không phải lỗi, nhưng nên fix)

Docusaurus 3 chạy strict hơn. Khi `pnpm build`:

- **`onBrokenLinks: 'warn'`** ([docusaurus.config.ts:20](../../../docusaurus.config.ts#L20)) → broken internal link chỉ warn. **Vẫn cần fix** trước khi commit. Tìm trong log: `Broken link`.
- **`onBrokenMarkdownLinks: 'warn'`** ([docusaurus.config.ts:21](../../../docusaurus.config.ts#L21)) → broken markdown link trong nội dung.
- **Mermaid parse error**: tìm `Mermaid` hoặc `parse error` trong log. Nguyên nhân hay gặp:
  - `&` chưa escape thành `&amp;`
  - Label node có `<` `>` chưa quote
  - Trùng tên node giữa các subgraph
- **Frontmatter lỗi**: thiếu `---` đóng, hoặc `sidebar_position` không phải số.

## Quy trình verify trước khi commit docs

1. `pnpm build` — nếu fail, đọc lỗi cuối log (Docusaurus in stack trace dài).
2. Kiểm warn về broken link / mermaid → fix hết.
3. Nếu sửa file trong [src/](../../../src/) → `pnpm typecheck`.
4. (Optional) `pnpm serve` để xem bản build production thật.

## Xử lý lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `Cannot find module` sau khi đổi branch | `pnpm install` — thường do `pnpm-lock.yaml` thay đổi |
| `EBUSY` / lock trên `.docusaurus/` (Windows) | Tắt dev server đang chạy → `pnpm clear` → chạy lại |
| Sidebar không hiện file mới | Kiểm `sidebar_position` trong frontmatter và prefix số trong tên file |
| Mermaid không render | Reload trang — Docusaurus sometimes cache; nếu vẫn fail thì là parse error, xem console browser |
| Broken link sang `/<section>/<file>.md` | Bỏ `.md` và thêm prefix số đầy đủ vì `numberPrefixParser: false` |
| Build OOM | `NODE_OPTIONS=--max-old-space-size=4096 pnpm build` (PowerShell: `$env:NODE_OPTIONS='--max-old-space-size=4096'; pnpm build`) |

## Anti-pattern

- ❌ Sửa file trong `build/` — đây là output, sẽ bị overwrite. Sửa trong `docs/` hoặc `src/`.
- ❌ Chạy `npm install` thay vì `pnpm install` — sẽ tạo `package-lock.json` lạ, conflict với `pnpm-lock.yaml`.
- ❌ Commit `.docusaurus/`, `build/`, `node_modules/` — đã có trong [.gitignore](../../../.gitignore).
- ❌ Để dev server chạy ngầm xong quên kill → port chiếm, lần sau lỗi `EADDRINUSE`.
