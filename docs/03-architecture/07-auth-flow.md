---
sidebar_position: 7
---

# Auth Flow

🔴 Placeholder

## 3 loại credential

| Loại | Dùng cho | Lifetime |
| --- | --- | --- |
| **Access Token (JWT)** | Web Console + API call có user | Short (15-30 min) |
| **Refresh Token** | Renew access token | Long (7-30 days), rotate |
| **API Key** | Server-to-server, embed widget | Permanent (revocable) |

## JWT claims

```json
{
  "sub": "<account_id>",
  "tid": "<tenant_id>",
  "wid": "<workspace_id>",
  "roles": ["workspace_admin"],
  "exp": 1234567890,
  "iat": 1234567890
}
```

→ Stateless verify ở Gateway. Khi cần revoke tức thì → check JWT ID vs Redis blacklist.

## OAuth/SSO (post-MVP)

- Google / Microsoft / GitHub OAuth
- SAML 2.0 cho enterprise
- SCIM cho user provisioning
