---
name: new-doc-page
description: Tạo trang docs mới trong repo CAP đúng convention Docusaurus — chọn section phù hợp, đặt prefix số khớp sidebar_position, sinh frontmatter và placeholder hợp lệ. Dùng khi user nói "thêm trang docs về X", "tạo file docs cho Y", hoặc khi cần document một entity/feature mới.
---

# new-doc-page — Tạo trang docs mới đúng convention

## Khi dùng skill này

- User yêu cầu **thêm 1 trang docs** vào section đã có (vd `02-domain/` thêm `08-billing.md`).
- User muốn **tạo 1 section mới hoàn toàn** (vd `10-integrations/`).
- Đang viết feature mới → cần stub trang để link tới.

## Convention bắt buộc (đừng phá vỡ)

1. **Tên file** = `<NN>-<kebab-name>.md` — `NN` là 2 chữ số, **trùng với `sidebar_position`** trong frontmatter. Ví dụ: `03-agent.md` ↔ `sidebar_position: 3`.
2. **Frontmatter** tối thiểu:
   ```yaml
   ---
   sidebar_position: N
   ---
   ```
   Trang landing có thể thêm `slug: /` (chỉ dùng cho `docs/intro.md`).
3. **H1** = tiêu đề trang, viết tiếng Anh kỹ thuật hoặc tiếng Việt tự nhiên (vd `# Agent`, `# Workflow Engine`, `# Kiến trúc tổng quan`).
4. **Trạng thái nội dung** đặt ngay dưới H1:
   - 🟢 Đã thống nhất
   - 🟡 Draft / Dự thảo
   - 🔴 Placeholder / Khung sườn
5. **Nội dung tiếng Việt**; giữ thuật ngữ tiếng Anh (Agent, Workflow, Tenant…).
6. **Internal link** dạng absolute không có `.md`: `[IAM & RBAC](/02-domain/02-iam-rbac)` — vì [docusaurus.config.ts:42](docusaurus.config.ts#L42) có `numberPrefixParser: false` nên prefix số **là một phần slug**.
7. **`numberPrefixParser: false`** → URL sẽ giữ nguyên `01-overview/02-architecture`. Đừng tự bỏ prefix khi viết link.

## Quy trình tạo trang mới trong section đã có

1. **Glob** `docs/<section>/*.md` để xem các file đang có và số prefix lớn nhất.
2. **Read** `docs/<section>/_category_.json` để hiểu chủ đề section.
3. Chọn prefix kế tiếp (vd section đang có `01-` → `06-`, file mới = `07-`).
4. Tạo file với template:
   ```markdown
   ---
   sidebar_position: <N>
   ---

   # <Tiêu đề>

   🔴 Placeholder

   <1-2 dòng mô tả mục tiêu của trang>

   ## <Heading section đầu>

   …
   ```
5. **Nếu trang nằm trong danh sách "Cấu trúc tài liệu" của [docs/intro.md](../../../docs/intro.md)** thì cập nhật bảng đó.
6. Verify bằng `pnpm start` — Docusaurus tự reload sidebar.

## Quy trình tạo section mới hoàn toàn

1. Tạo thư mục `docs/<NN>-<name>/` với `NN` = số tiếp theo (đang lớn nhất là `09-agent-access`).
2. Tạo `_category_.json`:
   ```json
   {
     "label": "<NN> — <Tên hiển thị>",
     "position": <N>,
     "link": {
       "type": "generated-index",
       "title": "<Tiêu đề landing>",
       "description": "<1 câu mô tả>"
     }
   }
   ```
3. Tạo ít nhất 1 file `01-<topic>.md` để section không rỗng.
4. Cập nhật bảng "Cấu trúc tài liệu" trong [docs/intro.md](../../../docs/intro.md).
5. `pnpm start` verify.

## Anti-pattern

- ❌ Đặt `sidebar_position` lệch với prefix số trong tên file → sidebar order vẫn đúng nhưng dev mới đọc sẽ rối.
- ❌ Tạo file `.mdx` khi không cần JSX — dùng `.md` mặc định.
- ❌ Hardcode tiếng Anh cho phần mô tả nghiệp vụ — repo locale là `vi`.
- ❌ Quên `_category_.json` khi tạo section mới → sidebar hiển thị tên thư mục thô.
- ❌ Internal link kiểu `./03-agent.md` hoặc `[link](../02-domain/03-agent)` — luôn dùng absolute `/02-domain/03-agent`.
- ❌ Bỏ qua trạng thái 🟢/🟡/🔴 → reader không biết tin được bao nhiêu.

## Tự kiểm tra trước khi báo "xong"

- [ ] Tên file khớp `sidebar_position`.
- [ ] Frontmatter hợp lệ (3 dấu `---` mở/đóng).
- [ ] Có badge trạng thái dưới H1.
- [ ] Mọi internal link là absolute và không `.md`.
- [ ] `pnpm start` không warn broken link / mermaid parse error.
