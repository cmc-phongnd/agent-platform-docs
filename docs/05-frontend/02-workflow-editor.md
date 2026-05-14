---
sidebar_position: 2
---

# Workflow Editor (drag-drop canvas)

🔴 Placeholder

## Library

**[XYFlow / React Flow v12](https://reactflow.dev/)** — chuẩn de facto cho node editor trong React.

Đặc điểm cần dùng:
- Custom node component (icon, port, status indicator)
- Edge routing (smoothstep, bezier)
- Minimap + zoom controls
- Selection + multi-select
- Undo/redo (yjs hoặc custom)
- Pan/zoom với touch + trackpad
- Copy/paste node

## Layout đề xuất

```
┌───────────────────────────────────────────────┐
│ Header: workflow name | save | publish | run │
├───────┬───────────────────────────────────────┤
│ Node  │                                       │
│ palette│           Canvas (XYFlow)            │
│       │                                       │
│       │                                       │
│       ├───────────────────────────────────────┤
│       │ Debug panel: variables | logs | trace│
└───────┴───────────────────────────────────────┘
       Right panel (selected node config) ─────►
```

## Realtime collab (post-MVP)

Yjs + WebSocket — multi-user edit same canvas.
