---
name: doc-navigator
description: Định vị nhanh chủ đề trong docs CAP và trả về đường dẫn chính xác. Dùng khi user hỏi "docs nào nói về X", "kiến trúc Y nằm ở đâu", hoặc khi cần dẫn link sang trang khác trong cùng repo. Đặc biệt hữu ích khi user hỏi bằng tiếng Việt với thuật ngữ nghiệp vụ (đa tenant, kho tri thức, kéo-thả…).
---

# doc-navigator — Định vị docs CAP

## Mục tiêu

Khi user hỏi về một chủ đề trong CAP, **đừng đoán** — định vị file/section đúng rồi trả lời kèm link `[text](path)` để user click được trong VSCode.

## Bản đồ section (cập nhật mỗi khi có file mới)

| Section | Chủ đề chính | Khi user hỏi về… |
| --- | --- | --- |
| [01-overview/](../../../docs/01-overview/) | Vision, kiến trúc tổng thể, glossary | Sản phẩm là gì, mục tiêu, thuật ngữ, big picture |
| [02-domain/](../../../docs/02-domain/) | Tenant, IAM/RBAC, Agent, Tool, Knowledge, Workflow, Conversation | Khái niệm nghiệp vụ, quan hệ giữa các entity, phân quyền |
| [03-architecture/](../../../docs/03-architecture/) | Services, data stores, workflow engine, tool runtime, RAG, multi-tenant, auth flow, observability | Kiến trúc kỹ thuật, "implement thế nào", flow chi tiết |
| [04-api/](../../../docs/04-api/) | API conventions, endpoints | REST/SSE/WS, error format, pagination, authentication |
| [05-frontend/](../../../docs/05-frontend/) | App shell, workflow editor | UI/UX, layout, component, drag-and-drop |
| [06-deployment/](../../../docs/06-deployment/) | Dev env, triển khai | Cài đặt local, infra, ops |
| [07-roadmap/](../../../docs/07-roadmap/) | Lộ trình v1 → v5 | Phạm vi MVP, milestone, ưu tiên feature |
| [08-references/](../../../docs/08-references/) | Phân tích Dify, Flowise, RAGFlow, Airflow | "So sánh với", "tham khảo từ đâu", "Dify làm thế nào" |
| [09-agent-access/](../../../docs/09-agent-access/) | MCP access, custom MCP spec | Agent ngoài đọc docs này, programmatic access |

## Quy trình khi user hỏi

1. **Phân loại câu hỏi** → mapping về section trong bảng trên. Nếu lưỡng lự giữa 2 section, ưu tiên section cụ thể hơn (vd `03-architecture` hơn `01-overview` cho câu hỏi technical).
2. **Tìm file chính xác**: dùng `Glob` với pattern `docs/<section>/*.md` rồi `Grep` keyword (cả tiếng Việt + tiếng Anh tương đương). Lưu ý glossary Việt↔Anh: *tenant*, *workspace*, *kho tri thức* = *Knowledge Base*, *quy trình* = *workflow*, *tác nhân* = *agent*, *kéo-thả* = *drag-and-drop*.
3. **Đọc đoạn liên quan** rồi trả lời ngắn gọn.
4. **Luôn dẫn link** dạng `[tên hiển thị](docs/<section>/<file>.md)` để user click được. Tránh path tuyệt đối `d:\…`.

## Mẹo

- Nếu câu hỏi mơ hồ kiểu "kiến trúc CAP" → mở [docs/01-overview/02-architecture.md](../../../docs/01-overview/02-architecture.md) trước, sau đó dẫn sang section `03-architecture/` cho chi tiết.
- Thuật ngữ chưa rõ → check [docs/01-overview/03-glossary.md](../../../docs/01-overview/03-glossary.md) trước khi tra section khác.
- Câu hỏi dạng "Dify/Flowise làm gì?" → trực tiếp `08-references/`.
- Câu hỏi "v2 có gì?" / "MVP có gì?" → `07-roadmap/`.

## Anti-pattern

- ❌ Trả lời từ kiến thức chung mà không mở docs thực tế — docs CAP có decision/convention riêng, đừng nói từ memory.
- ❌ Đoán đường dẫn (vd suy ra `docs/02-domain/agent.md` thay vì `03-agent.md`) — luôn `Glob` để chắc.
- ❌ Bỏ qua trạng thái nội dung (🟢/🟡/🔴) khi trích dẫn — nếu trang là 🔴 placeholder, nói rõ với user.
