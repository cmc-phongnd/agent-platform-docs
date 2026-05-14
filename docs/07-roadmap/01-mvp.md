---
sidebar_position: 1
---

# MVP scope

🔴 Placeholder

## In scope (MVP)

- ✅ Multi-tenant + Workspace (2 cấp)
- ✅ RBAC built-in roles
- ✅ Agent CRUD + chat
- ✅ Built-in tools (5-10 cái) + custom REST tool
- ✅ Knowledge Base với pgvector + hybrid search
- ✅ Workflow editor cơ bản (start/end/llm/tool/agent/branch/code)
- ✅ Public API (chat, invoke workflow)
- ✅ Basic observability (logs + traces)
- ✅ Docker Compose deploy

## Post-MVP (v1)

- Workflow advanced nodes (loop, human-input, sub-workflow)
- MCP tool support
- SSO/OAuth
- Reranking model
- Audit log UI
- Cost dashboard
- Multi-region

## Out of scope (sẽ không làm)

- Fine-tuning UI
- Native mobile app
- Edge inference
- Marketplace public

## Phasing đề xuất

| Phase | Tuần | Deliverable |
| --- | --- | --- |
| P0 — Foundation | 1-2 | Tenant, Workspace, RBAC, Auth, basic UI |
| P1 — Provider + Agent | 3-4 | LLM provider config, Agent CRUD + chat |
| P2 — Knowledge | 5-7 | KB ingest pipeline, retrieval |
| P3 — Workflow | 8-11 | Editor + engine cơ bản |
| P4 — Tool ecosystem | 12-13 | Custom REST, MCP |
| P5 — Polish | 14-16 | Observability, docs, test |
