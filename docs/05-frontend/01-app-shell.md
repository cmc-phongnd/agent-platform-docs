---
sidebar_position: 1
---

# App Shell

🔴 Placeholder

## Stack đề xuất

- **Framework**: Next.js 14 (App Router)
- **UI**: TailwindCSS + Radix / shadcn-ui
- **State**: Zustand (client state) + TanStack Query (server state)
- **Form**: React Hook Form + Zod
- **i18n**: next-intl (vi, en)

## Route layout

```
/
├── login
├── workspaces                       # list workspace
├── (workspace)/[wid]
│   ├── dashboard
│   ├── agents
│   │   ├── [id]                     # detail
│   │   └── [id]/edit                # builder
│   ├── workflows
│   │   ├── [id]
│   │   └── [id]/canvas              # drag-drop canvas
│   ├── knowledge
│   │   └── [kb_id]
│   ├── tools
│   ├── settings
│   │   ├── members
│   │   ├── providers
│   │   └── api-keys
│   └── analytics
└── (tenant)/[tid]
    ├── workspaces
    ├── members
    ├── billing
    └── audit-log
```
