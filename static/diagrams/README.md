# Diagrams — workflow draw.io

Thư mục chứa **source `.drawio`** và **export `.svg`** của tất cả sơ đồ kiến trúc trong product-docs.

## Nguyên tắc

1. **Mọi sơ đồ phải có cả `.drawio` và `.svg`** — `.drawio` là source để sửa, `.svg` là kết quả nhúng vào doc.
2. **Đặt tên kebab-case theo nội dung**, không theo số trang: `arch-overview.drawio`, `ingest-pipeline.drawio` (không phải `02-fig1.drawio`).
3. **Cả 2 file commit chung 1 lần** — không bao giờ commit chỉ `.drawio` mà thiếu `.svg` hoặc ngược lại.
4. **Sub-folder theo section** nếu nhiều: `overview/`, `domain/`, `architecture/`…

## Workflow

### 1. Tạo / sửa sơ đồ

**Option A — Online (không cần cài đặt)**:

1. Mở [app.diagrams.net](https://app.diagrams.net)
2. Chọn `Open Existing Diagram` → chọn file `.drawio` trong thư mục này (hoặc `Create New`)
3. Vẽ / sửa

**Option B — Desktop (khuyến nghị, không cần internet)**:

1. Cài [draw.io desktop](https://github.com/jgraph/drawio-desktop/releases)
2. Mở file `.drawio` trực tiếp từ File Explorer

### 2. Export ra SVG

Trong draw.io:

1. `File` → `Export As` → `SVG...`
2. Cấu hình:
   - **Zoom**: 100%
   - **Border Width**: 10
   - **Size**: `Diagram`
   - ✅ **Transparent Background**
   - ✅ **Include a copy of my diagram** (để click vào SVG mở lại được trong draw.io)
   - ❌ **Embed Images** (để file SVG nhẹ; nếu icon dùng URL ngoài sẽ broken — khi đó bật)
3. Lưu cùng tên với `.drawio`, đuôi `.svg`

### 3. Nhúng vào doc

Trong file markdown của Docusaurus:

```markdown
![Kiến trúc tổng quan CAP](/diagrams/arch-overview.svg)
```

Docusaurus serve `static/` từ root, nên đường dẫn bắt đầu bằng `/diagrams/...`.

Để có caption + frame đẹp, có thể bọc:

```markdown
<figure>
  <img src="/diagrams/arch-overview.svg" alt="Kiến trúc tổng quan CAP" />
  <figcaption>Kiến trúc tổng quan CAP — 5 lớp chức năng</figcaption>
</figure>
```

## Icon library trong draw.io

Khi vẽ, mở shape panel:

- **AWS** (AWS19 / AWS17 / AWS4): icon AWS các phiên bản
- **GCP**: Google Cloud
- **Azure**: Microsoft
- **Kubernetes**: K8s components
- **Cisco**, **Networking**: thiết bị mạng
- Nếu thiếu icon CAP-specific: tự vẽ shape custom, save vào library `cap-icons` (có thể export library `.xml` và share)

## Quy ước màu (đồng bộ với HTML diagram trong [01-overview/02-architecture.md](../../docs/01-overview/02-architecture.md))

| Lớp | Màu border | Hex |
| --- | --- | --- |
| Clients / Người dùng | xám | `#6b7280` |
| Edge | xanh dương | `#3b82f6` |
| Application | cam | `#f59e0b` |
| Data | xanh lá | `#10b981` |
| Observability | tím | `#8b5cf6` |
| External | đỏ | `#ef4444` |

## Danh sách sơ đồ

| File | Trang dùng | Trạng thái |
| --- | --- | --- |
| _(chưa có — sẽ điền khi tạo sơ đồ đầu tiên)_ | — | — |
