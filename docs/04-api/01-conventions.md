---
sidebar_position: 1
---

# API Conventions

🔴 Placeholder

## Phân loại

| API | Base path | Audience |
| --- | --- | --- |
| **Console API** | `/console/api/v1` | Builder qua Web Console (JWT) |
| **Public API** | `/api/v1` | End-user app / external system (API key) |
| **Webhook In** | `/webhook/<id>` | 3rd party push to CAP |
| **Webhook Out** | (CAP push to user) | CAP notify user system |

## Style

- RESTful + JSON
- Versioning ở path (`/v1/`)
- Pagination: cursor-based (`?cursor=xxx&limit=20`)
- Sort/Filter: query string (`?sort=-created_at&filter[status]=published`)
- Streaming: SSE (`text/event-stream`) cho chat, WebSocket cho realtime collab

## Error format

```json
{
  "error": {
    "code": "workflow.invalid_graph",
    "message": "Cycle detected in workflow graph",
    "request_id": "req_abc123",
    "details": {...}
  }
}
```
