---
sidebar_position: 8
---

# Observability

🔴 Placeholder

## 3 signals

| Signal | Lưu ở | UI |
| --- | --- | --- |
| **Traces** | Tempo | Grafana Tempo |
| **Logs** | Loki | Grafana Logs |
| **Metrics** | Prometheus | Grafana Dashboard |

## Span structure cho workflow run

```
workflow.run (root span)
├── node.execution (LLM)
│   ├── llm.invoke (with tokens, cost)
│   └── llm.tool_call
│       └── tool.execute
├── node.execution (knowledge_retrieval)
│   ├── embedding.encode
│   └── vector.search
└── node.execution (end)
```

## Cost tracking

Mỗi LLM call ghi span attribute:
- `llm.input_tokens`
- `llm.output_tokens`
- `llm.cost_usd`
- `llm.provider`
- `llm.model`

→ Aggregate ra dashboard per tenant/workspace để billing + chargeback.

## Audit log (riêng)

Audit là **log đặc biệt** (giữ lâu, không drop): tenant/workspace CRUD, permission grant, credential update.

→ Lưu Postgres `audit_logs` (table riêng) + ship sang Loki để query.
