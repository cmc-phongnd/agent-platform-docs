---
sidebar_position: 4
---

# Tool

🔴 Placeholder

## 4 loại tool

| Loại | Mô tả | Ví dụ |
| --- | --- | --- |
| **Built-in** | Implement sẵn trong CAP, không cần config | Web search, calculator, code interpreter |
| **Custom REST** | User cung cấp OpenAPI/Swagger, CAP làm proxy | Internal CRM API, weather API |
| **MCP** | Model Context Protocol server | GDrive MCP, Slack MCP, GitHub MCP |
| **Workflow-as-Tool** | 1 workflow được expose như tool cho agent khác gọi | Reusable sub-flow |

## Schema chung

Mọi tool cần khai báo JSON schema (đầu vào + đầu ra) để LLM hiểu cách gọi.

## Sandbox

Tool chạy trong **Tool Runtime** process tách rời:
- Không có access trực tiếp DB
- Resource limit (CPU, memory, network egress)
- Timeout

## Câu hỏi mở

- Custom REST tool có nên cho phép HTTP POST với body lớn?
- MCP local vs remote — local thì sandbox thế nào?
- Tool có thể có credential per-user (vd OAuth GDrive cá nhân) hay chỉ per-workspace?
