---
sidebar_position: 1
---

# Dev Environment

🔴 Placeholder

## Tooling

| Tool | Mục đích |
| --- | --- |
| `uv` | Python package manager |
| `pnpm` | Node package manager |
| Docker Desktop | Container runtime (cho DB, Redis, vector) |
| `make` (hoặc `task`) | Task runner |
| `pre-commit` | Lint/format pre-commit hook |

## Layout repo dự kiến

```
cap/
├── backend/          # FastAPI + Celery
│   ├── api/
│   ├── engine/
│   ├── worker/
│   ├── tool_runtime/
│   └── pyproject.toml
├── frontend/         # Next.js
├── docker/           # docker-compose.yaml + Dockerfile
├── infra/            # K8s manifests / Helm chart
└── product-docs/     # tài liệu này
```
