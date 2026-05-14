---
sidebar_position: 3
---

# Glossary

🟡 Draft

Thuật ngữ chuẩn dùng trong toàn bộ doc CAP. Cần thống nhất sớm để code/docs/UI không phân kỳ.

## Tổ chức & người dùng

| Term | Định nghĩa | Khác biệt với Dify |
| --- | --- | --- |
| **Tenant** | Một tổ chức/khách hàng. Đơn vị isolation cao nhất. Có billing, plan, quota riêng | Tương đương `tenant` trong Dify |
| **Workspace** | Một không gian làm việc trong tenant. 1 tenant có N workspace | **Mới** — Dify không có khái niệm này; workspace của Dify = tenant |
| **Account** | User toàn cục, đăng nhập qua email + password hoặc SSO | Tương đương `account` |
| **Membership** | Quan hệ Account ↔ Tenant với 1 role | Tương đương `tenant_account_joins` |
| **Workspace Membership** | Quan hệ Account ↔ Workspace với 1 role (override membership ở tenant level) | **Mới** |
| **End User** | Người dùng cuối, chat với agent, không có account hệ thống | Tương đương `end_users` |

## Resource

| Term | Định nghĩa |
| --- | --- |
| **Agent** | LLM agent có system prompt, model config, tool list, knowledge list, memory config |
| **Tool** | Khả năng agent gọi: built-in / custom REST / MCP / workflow-as-tool |
| **Knowledge Base** | Tập hợp document đã ingest để retrieval (RAG) |
| **Document** | File/URL/page nguồn được upload vào Knowledge Base |
| **Segment** (= Chunk) | 1 đoạn text được cắt từ document, là đơn vị embed + retrieval |
| **Workflow** | Đồ thị các node được kéo-thả, chạy theo thứ tự (có thể có branching, loop) |
| **Node** | 1 bước trong workflow. Loại: LLM, Agent, Tool, Branch, Loop, Code, Human-input, Sub-workflow... |
| **Workflow Run** | 1 lần execute của workflow, có trace từng node |
| **Conversation** | Phiên chat giữa end-user và agent (có nhiều message) |
| **Message** | 1 lượt chat (user query hoặc assistant answer) |

## RBAC

| Term | Định nghĩa |
| --- | --- |
| **Role** | Bộ quyền được đặt tên (vd `tenant_owner`, `workspace_admin`, `editor`) |
| **Permission** | Hành động cụ thể (vd `workflow.create`, `agent.publish`, `tenant.billing.read`) |
| **Scope** | Phạm vi của permission: `tenant`, `workspace`, `resource_type`, `resource_instance` |
| **Policy** | Tập hợp (subject, role, scope) — cấp quyền cho ai làm gì ở đâu |

## Runtime

| Term | Định nghĩa |
| --- | --- |
| **Provider** | Cấu hình credential gọi LLM/Embedding (OpenAI, Anthropic, ...) |
| **Model Config** | Chọn model cụ thể của provider + tham số (temperature, max_tokens, ...) |
| **Trace** | OpenTelemetry trace cho 1 workflow run / conversation |
| **Span** | 1 đơn vị work trong trace (1 node, 1 LLM call, 1 tool call) |

## Storage

| Term | Định nghĩa |
| --- | --- |
| **Metadata DB** | Postgres chính, chứa toàn bộ entity quan hệ |
| **Vector Store** | Vector DB (pgvector/Qdrant/...) chứa embedding |
| **Embedding Cache** | Bảng Postgres lưu vector kèm hash text, tránh re-embed cùng text |
| **Object Storage** | S3/MinIO lưu file gốc, artifact |
| **Collection** | 1 bảng/index trong Vector Store, thường = 1 knowledge base hoặc 1 (provider, model) |

## Quy ước viết

- **Identifier**: snake_case (`tenant_id`, `workflow_run_id`)
- **Entity name** (UI/docs): PascalCase tiếng Anh (Workflow, Agent, Knowledge Base)
- **Action**: lower-case verb (chat, invoke, ingest, retrieve)
- **Tiếng Việt**: dùng cho narrative; **Tiếng Anh**: dùng cho identifier, tên field, tên endpoint
