---
sidebar_position: 2
---

# IAM & RBAC

🔴 Placeholder

## Mô hình permission

3 cấp scope, kết hợp role + permission rời rạc:

```
Subject (Account)
   │ has-role
   ▼
Role  ─── grants ──►  Permission set
   │ at-scope
   ▼
Scope: Tenant | Workspace | ResourceType | ResourceInstance
```

## Built-in roles (tentative)

| Role | Scope | Quyền chính |
| --- | --- | --- |
| `tenant_owner` | Tenant | Mọi thứ trong tenant, set billing |
| `tenant_admin` | Tenant | Quản lý workspace + member, không billing |
| `workspace_owner` | Workspace | Toàn quyền workspace |
| `workspace_admin` | Workspace | Quản lý resource + member trong workspace |
| `workspace_editor` | Workspace | Sửa nội dung, không xoá/publish |
| `workspace_viewer` | Workspace | Read-only |
| `workspace_api` | Workspace | Chỉ gọi API, không có UI access |
| `auditor` | Tenant/Workspace | Read-only + audit log access |

## Permission naming convention

`<resource>.<action>` hoặc `<resource>.<sub>.<action>`:

- `workflow.create`, `workflow.read`, `workflow.update`, `workflow.delete`, `workflow.publish`
- `agent.create`, `agent.invoke`
- `knowledge.document.upload`, `knowledge.document.delete`
- `tenant.billing.read`, `tenant.member.invite`

## Câu hỏi mở

- Cho phép custom role không, hay chỉ built-in role?
- Permission ở instance level (1 agent cụ thể, không phải tất cả agent) hỗ trợ thế nào?
- SSO/SAML/SCIM trong MVP hay sau?
