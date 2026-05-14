---
sidebar_position: 7
---

# Conversation & Run

🔴 Placeholder

## Mô hình

Có **2 loại "lần chạy"** trong CAP:

| | Conversation | Workflow Run |
| --- | --- | --- |
| Trigger | Chat (user gửi message) | API/schedule/event |
| Stateful | ✅ (có history) | ❌ (mỗi run độc lập, trừ khi save state) |
| Đơn vị | Message | Node execution |
| Thường dùng cho | Chatbot agent | Pipeline tự động |

```mermaid
erDiagram
    Conversation ||--o{ Message : contains
    Message ||--o{ ToolCall : invokes
    Message ||--o{ Trace : has
    WorkflowRun ||--o{ NodeExecution : runs
    NodeExecution ||--o{ Trace : has
    Conversation }o--|| Agent : with
    WorkflowRun }o--|| Workflow : of
```

## Câu hỏi mở

- Conversation memory: full history vs summary vs vector memory?
- Workflow run có thể "resume" được không (sau crash)?
- Đặt ngưỡng nào để tự động truncate conversation?
