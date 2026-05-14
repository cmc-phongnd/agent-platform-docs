---
sidebar_position: 4
---

# Tool Runtime

🔴 Placeholder

## Yêu cầu

- Isolation (tool không truy cập DB CAP trực tiếp)
- Resource limit (CPU, mem, network egress)
- Timeout
- Credential injection an toàn (không log secret)
- Support nhiều ngôn ngữ tool (Python initial, JS sau)

## Sandbox options

| Option | Isolation | Overhead | Phù hợp |
| --- | --- | --- | --- |
| Subprocess + ulimit | ⚠️ Medium | Low | MVP |
| Docker container per call | ✅ Strong | High (start ~1s) | Production |
| gVisor | ✅ Strong | Medium | High security |
| WASM | ✅ Strong | Low | Tương lai |
| Process pool (firejail) | ⚠️ Medium | Low | MVP alt |

→ MVP: subprocess pool + resource limit. Switch container khi cần.
