---
sidebar_position: 1
---

# Dify

🟢 Reference notes có sẵn

## Tham khảo gì từ Dify

| Mảng | Mức độ tham khảo |
| --- | --- |
| Domain model (agent/workflow/knowledge) | ✅ Cao — gần với CAP |
| DB schema | ✅ Cao — học pattern (snapshot rule, embedding cache, parent-child chunks) |
| Workflow engine | ⚠️ Trung — engine Dify chưa durable |
| RAG pipeline | ✅ Cao — pipeline đầy đủ, nhiều mode |
| Multi-tenant | ⚠️ Trung — Dify chỉ tenant level, không workspace |
| Tool framework | ✅ Cao — built-in + custom + MCP + workflow-as-tool |
| Frontend | ⚠️ Trung — code phức tạp, nên simplify |

## Notes chi tiết (link ngoài)

Đặt ở `docs/01-dify/` của workspace (research notes, không phải doc CAP):

- `docs/01-dify/01-architecture.md` — Kiến trúc tổng thể
- `docs/01-dify/02-db-schema.md` — Schema 110 bảng
- `docs/01-dify/03-code-flow.md` — Code flow
- `docs/01-dify/04-user-flow.md` — User flow
- `docs/01-dify/05-workflow-engine.md` — Workflow engine
- `docs/01-dify/06-knowledge-base-flow.md` — RAG full flow
- `docs/01-dify/07-rag-internals.md` — RAG internals Q&A

## Patterns CAP nên kế thừa

1. **Embedding cache** (`embeddings` table) — dedup theo hash
2. **Snapshot process rules** — re-index reproducible
3. **`dataset_collection_bindings`** — share vector collection
4. **Parent-child chunks** — search precision + context coverage
5. **Pipeline RAG modular** — workflow-as-ingest-pipeline

## Patterns CAP nên **tránh**

1. ❌ Tenant không có workspace concept
2. ❌ Pickle BLOB cho embedding (dùng pgvector native + dedicated cache strategy)
3. ❌ Trộn Console API + Public API chung 1 binary
4. ❌ Frontend monolith với code path đặc thù khó maintain
