---
sidebar_position: 2
---

# Endpoints (sketch)

🔴 Placeholder — chi tiết sẽ generate từ OpenAPI sau

## Tenant & Workspace

| Method | Path | Mô tả |
| --- | --- | --- |
| `POST` | `/console/api/v1/tenants` | Create tenant (super admin) |
| `GET`  | `/console/api/v1/tenants/me` | Get current tenant |
| `POST` | `/console/api/v1/workspaces` | Create workspace |
| `GET`  | `/console/api/v1/workspaces` | List workspace của user |

## Agent

| Method | Path |
| --- | --- |
| `POST` | `/console/api/v1/workspaces/:wid/agents` |
| `GET` | `/console/api/v1/workspaces/:wid/agents` |
| `GET` | `/console/api/v1/workspaces/:wid/agents/:id` |
| `PATCH` | `/console/api/v1/workspaces/:wid/agents/:id` |
| `POST` | `/console/api/v1/workspaces/:wid/agents/:id/publish` |
| `POST` | `/api/v1/agents/:id/invoke` (public API, dùng API key) |

## Workflow

| Method | Path |
| --- | --- |
| `POST` | `/console/api/v1/workspaces/:wid/workflows` |
| `GET` | `/console/api/v1/workspaces/:wid/workflows/:id` |
| `POST` | `/console/api/v1/workspaces/:wid/workflows/:id/runs` |
| `GET` | `/console/api/v1/workspaces/:wid/workflows/:id/runs/:run_id` |
| `POST` | `/api/v1/workflows/:id/run` (public API) |

## Knowledge

| Method | Path |
| --- | --- |
| `POST` | `/console/api/v1/workspaces/:wid/knowledge` |
| `POST` | `/console/api/v1/workspaces/:wid/knowledge/:kb_id/documents` |
| `GET`  | `/console/api/v1/workspaces/:wid/knowledge/:kb_id/documents/:doc_id` |
| `POST` | `/api/v1/knowledge/:kb_id/retrieve` (public API) |
