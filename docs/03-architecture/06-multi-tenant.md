---
sidebar_position: 6
---

# Multi-tenant Isolation

🔴 Placeholder

## Tiêu chí so sánh

| | Row-level | Schema-per-tenant | DB-per-tenant |
| --- | --- | --- | --- |
| Isolation | Soft (app enforce) | Medium | Hard |
| Migration | 1 lần | N lần (mỗi tenant) | N lần |
| Cost | Thấp | Trung bình | Cao |
| Noisy neighbor | Có | Giảm | Không |
| Hỗ trợ tốt? | Mọi DB | Postgres | Mọi DB |
| Phù hợp | < 1000 tenant | 1000-10000 | Enterprise plan |

→ MVP: **Row-level** với `tenant_id` + `workspace_id` ở mọi bảng. Enforce ở repository layer.

## Repository pattern

```python
class WorkflowRepository:
    def __init__(self, session, tenant_id, workspace_id):
        self._session = session
        self._tenant_id = tenant_id    # ← bind sẵn
        self._workspace_id = workspace_id

    def list(self):
        return self._session.scalars(
            select(Workflow).where(
                Workflow.tenant_id == self._tenant_id,    # ← luôn filter
                Workflow.workspace_id == self._workspace_id,
            )
        ).all()
```

→ Không cho phép construct repository không có tenant context. Test luôn check leak.
