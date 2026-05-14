---
name: glossary-sync
description: Đồng bộ thuật ngữ giữa các trang docs với glossary trung tâm. Dùng khi thêm trang/khái niệm mới, khi user nói "thuật ngữ X chưa thống nhất", "thêm vào glossary", hoặc khi review xem có term nào bị viết khác chuẩn không.
---

# glossary-sync — Đồng bộ thuật ngữ CAP

## Vì sao có skill này

Docs CAP nhiều trang nên dễ phân kỳ thuật ngữ: cùng 1 khái niệm có chỗ gọi *workspace*, chỗ gọi *không gian làm việc*, chỗ gọi *project*. Glossary trung tâm tại [docs/01-overview/03-glossary.md](../../../docs/01-overview/03-glossary.md) là **nguồn duy nhất** — mọi trang khác phải dùng cùng tên.

## Khi dùng skill này

- Thêm 1 trang docs có khái niệm/entity mới → kiểm xem glossary đã có chưa.
- User nói "term X dùng không thống nhất" → quét toàn repo, đề xuất chuẩn hóa.
- Trước milestone lớn (vd close MVP docs) → audit toàn bộ.

## Quy trình

### Khi vừa thêm/sửa 1 trang

1. **Đọc** trang vừa sửa, liệt kê các **danh từ riêng / khái niệm domain** (Bold trong markdown thường là dấu hiệu).
2. **Đối chiếu** với [glossary](../../../docs/01-overview/03-glossary.md) — đã có entry chưa?
3. Nếu **chưa có** → thêm dòng vào bảng phù hợp (Tổ chức & người dùng / Resource / RBAC / Runtime / Storage / …).
4. Nếu **có rồi nhưng tên khác** (vd dùng "không gian làm việc" thay vì "Workspace") → sửa trang về tên chuẩn.

### Audit toàn repo

1. **Grep** từng term chuẩn trong glossary, kiểm `count` ở mỗi file để spot phân bố lạ:
   ```
   pattern: \b(Workspace|workspace|không gian làm việc)\b
   output_mode: count
   path: docs/
   ```
2. Với các từ tiếng Việt có biến thể (dấu / không dấu / hoa thường), grep cả các biến thể.
3. Lập bảng cần sửa, sửa từng file, mỗi sửa 1 commit nhỏ.

## Cặp Việt ↔ Anh chuẩn (extract từ glossary hiện tại)

| Tiếng Việt thường dùng | Term chuẩn (giữ tiếng Anh) | Ghi chú |
| --- | --- | --- |
| Tổ chức | **Tenant** | Đơn vị isolation cao nhất |
| Không gian làm việc | **Workspace** | 1 tenant có N workspace |
| Thành viên | **Member** / **Account** | Account là user toàn cục; Member là quan hệ |
| Người dùng cuối | **End User** | Không có account hệ thống |
| Vai trò | **Role** | Cấu thành từ Permission |
| Quyền | **Permission** | Hành động cụ thể |
| Tác nhân AI | **Agent** | LLM agent |
| Công cụ | **Tool** | Built-in / REST / MCP / workflow-as-tool |
| Kho tri thức | **Knowledge Base** | Tập document để RAG |
| Tài liệu | **Document** | File/URL nguồn |
| Đoạn / chunk | **Segment** | Đơn vị embed |
| Quy trình | **Workflow** | Đồ thị node |
| Nút / bước | **Node** | 1 bước trong workflow |
| Lượt chạy | **Workflow Run** | 1 execute |
| Phiên chat | **Conversation** | Nhiều message |
| Lượt chat | **Message** | 1 turn |
| Truy vết | **Trace** / **Span** | OpenTelemetry |
| Hạn mức | **Quota** | Theo workspace/agent/user |

> 💡 **Style**: trong văn bản tiếng Việt, dùng từ tiếng Anh viết hoa đầu (vd "Workspace", "Agent") khi nói về **khái niệm hệ thống**. Khi cần giải thích, mở ngoặc tiếng Việt: *"Workspace (không gian làm việc)"* — chỉ làm vậy ở **lần xuất hiện đầu tiên** trong trang.

## Khi thêm entry mới vào glossary

Format chuẩn (theo bảng hiện có):

```markdown
| **<Term>** | <Định nghĩa 1 câu, có ví dụ nếu cần> | <Khác biệt với Dify nếu có — optional> |
```

- Định nghĩa **dưới 25 từ**, không lan man.
- Term in đậm.
- Nếu là term **mới** (Dify không có) → ghi rõ "**Mới**" ở cột "Khác biệt với Dify".
- Đặt vào đúng bảng (Tổ chức / Resource / RBAC / Runtime / Storage). Nếu không thuộc bảng nào → tạo bảng mới với heading `## <Nhóm>`.

## Anti-pattern

- ❌ Đổi term ở 1 trang mà quên các trang khác — luôn grep toàn repo trước khi rename.
- ❌ Thêm entry glossary mà không kiểm trang nào đang gọi sai → dữ liệu lệch tiếp tục.
- ❌ Dịch thuật ngữ kỹ thuật sang tiếng Việt (vd "Lưu trữ vector" thay vì "Vector Store") khi đã có term tiếng Anh chuẩn.
- ❌ Định nghĩa dài như paragraph trong cột Định nghĩa — quá tải bảng. Nếu cần dài → link sang trang chi tiết: `xem [Agent](/02-domain/03-agent)`.
