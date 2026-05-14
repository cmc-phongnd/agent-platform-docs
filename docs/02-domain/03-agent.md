---
sidebar_position: 3
---

# Agent

🟡 Draft — v0.1

> Trang này định nghĩa **khái niệm Agent** trong CAP — đối tượng AI phục vụ end-user hoặc tham gia workflow. Đối tượng đọc: BA, PO, builder, kiến trúc sư.
>
> Chi tiết kỹ thuật (model invocation, prompt rendering, tool dispatch) ở [Section 3 — Workflow Engine](/03-architecture/03-workflow-engine).

---

## 1. Vì sao Agent

Agent là **đơn vị giá trị nghiệp vụ** mà builder tạo ra trên CAP. Nếu ví CAP là "AWS cho AI", thì Agent là "EC2 instance" — đối tượng cụ thể người dùng tương tác.

Liên hệ với [Vision](/01-overview/01-vision):

- **§ 3 — Trao quyền nghiệp vụ**: BA/PM tạo Agent qua UI no-code → giải bài toán phòng ban mà không cần dev
- **§ 5 — Tri thức nội bộ ưu tiên**: Agent gắn với Knowledge Base của tổ chức → trả lời có dẫn nguồn, không bịa

### 1.1 Agent vs Workflow — khác nhau ở đâu

| Agent | Workflow |
| --- | --- |
| **Brain**: LLM ra quyết định mỗi bước | **Pipeline**: các bước cố định, deterministic |
| Tương tác **multi-turn** với người | Chạy **end-to-end** rồi kết thúc |
| Nhận query tự do, tự chọn tool | Input có schema, output có schema |
| Phù hợp: chatbot, trợ lý ảo, tư vấn | Phù hợp: tự động xử lý đơn, phê duyệt, ETL |

→ **Trong CAP**, Agent có thể là **một node trong Workflow** — workflow gọi agent để xử lý sub-task cần LLM reasoning. Xem [Workflow §4](/02-domain/06-workflow).

---

## 2. 5 nguyên tắc thiết kế

| # | Nguyên tắc | Hệ quả |
| --- | --- | --- |
| 1 | **Agent có identity rõ ràng** | Mỗi agent có tên, avatar, mô tả, welcome message — end-user biết đang nói chuyện với "ai" |
| 2 | **Prompt là source of truth, không phải code** | System prompt + tool selection được builder edit qua UI, không phải nhờ dev. Có versioning |
| 3 | **Mọi quyết định AI đều log được** | Mỗi lượt chat ghi: prompt nào, tool nào được gọi, LLM trả gì, hết bao nhiêu tiền |
| 4 | **Safety mặc định** | Có content filter, max iterations, max cost per conversation — không có chế độ "trust me" |
| 5 | **Provider-agnostic** | Đổi LLM provider (OpenAI ↔ Anthropic ↔ vLLM nội bộ) không phải rebuild agent — chỉ cập nhật config |

---

## 3. Mô hình khái niệm

```mermaid
erDiagram
    Workspace ||--o{ Agent : owns
    Agent ||--o{ AgentVersion : "có versions"
    AgentVersion ||--|| ModelConfig : "cấu hình LLM"
    AgentVersion ||--|| PromptTemplate : "system prompt"
    AgentVersion }o--o{ Tool : "có thể gọi"
    AgentVersion }o--o{ KnowledgeBase : "có thể retrieval"
    AgentVersion ||--|| MemoryConfig : "cấu hình memory"
    AgentVersion ||--|| SafetyConfig : "cấu hình safety"
    Agent ||--o{ Conversation : "phục vụ"
    Agent ||--o{ DeploymentSurface : "expose qua"

    Agent {
        string id
        string workspace_id
        string name
        string display_name
        string description
        string avatar_url
        string status "draft|published|archived"
        string published_version_id
        datetime created_at
    }
```

### 3.1 Thành phần một Agent

| Thành phần | Mô tả |
| --- | --- |
| **Model config** | Provider (OpenAI/Anthropic/...), model cụ thể (gpt-4o, claude-3.5), temperature, max_tokens |
| **System prompt** | Instruction định danh agent: persona, mục tiêu, ràng buộc, ví dụ few-shot |
| **Tools** | Danh sách tool agent được gọi (xem [Tool](/02-domain/04-tool)) |
| **Knowledge** | Danh sách KB agent được retrieval (xem [Knowledge Base](/02-domain/05-knowledge)) |
| **Memory** | Cấu hình memory: số message giữ trong context, summary policy khi dài |
| **Safety** | Content filter, max iterations, max cost per conversation, refused topics |
| **Identity** | Display name, avatar, description, welcome message, suggested prompts |
| **Deployment** | Surface expose: chat URL public, embed iframe, API endpoint, Slack/Teams bot |

---

## 4. 3 loại Agent

CAP hỗ trợ 3 mô hình tương tác — config khác nhau:

### 4.1 Chatbot conversational (most common)

Multi-turn với end-user. Giữ memory của conversation. Stream từng token.

**Use case**: HR FAQ, Customer support, Internal helpdesk.

### 4.2 Task autonomous

Nhận task, tự quyết tool chain, tự loop tới khi xong (max N steps). Không có user input giữa chừng (trừ khi explicit `human_input` node).

**Use case**: Compliance reviewer (đọc document → check rules → output report), Lead qualifier.

### 4.3 Workflow step

Agent là **1 node trong workflow** — nhận input có schema, output có schema. Không có memory cross-run.

**Use case**: Bóc tách thông tin từ hợp đồng, dịch ngôn ngữ, classify request.

---

## 5. Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Builder tạo
    Draft --> Testing: tạo test conversation
    Testing --> Draft: chỉnh sửa
    Draft --> Published: workspace_owner approve + publish
    Published --> Published: tạo version mới (immutable)
    Published --> Archived: xoá khỏi production
    Archived --> [*]: hard delete sau 90 ngày
```

### 5.1 Draft

- Chỉ builder & người được chia sẻ thấy
- Test bằng "test conversation" ảo, không tính chi phí thật
- Mọi field sửa thoải mái

### 5.2 Published

- Có version cụ thể (vd `v3`). Mỗi publish tạo **immutable snapshot**
- End-user / API consumer dùng `published_version_id` này
- Sửa system prompt → tạo `v4`, không sửa `v3`
- Có thể rollback bằng cách set `published_version_id` về `v3`

### 5.3 Vì sao immutable version

- **Reproducibility**: bug ở v3 có thể reproduce sau khi đã v4
- **A/B testing**: chạy song song v3 và v4 cho 50% traffic mỗi bên
- **Audit**: end-user khiếu nại tuần trước về 1 câu trả lời → xác định version nào trả lời

---

## 6. Use cases nghiệp vụ

### 🎯 Use case A — HR Helpdesk Bot

> *"Nhân viên hỏi nhanh về quy trình nghỉ phép, chấm công, chính sách phúc lợi — không cần đợi HR trả lời thủ công."*

**Setup**:

- Loại: Chatbot conversational
- Knowledge: KB "HR Policy" (handbook, FAQ, mẫu đơn)
- Tools: `calendar.check_leave_balance`, `email.send_to_hr` (escalation)
- Memory: giữ 10 message gần nhất
- Safety: refused topics = "lương, đánh giá performance" → escalate human

### 🎯 Use case B — Sales Lead Qualifier

> *"Form submit từ website → tự động chấm điểm lead (Hot/Warm/Cold) + ghi vào CRM."*

**Setup**:

- Loại: Workflow step
- Input schema: `{name, company, message, source}`
- Tool: `crm.lookup_company`, `crm.create_lead`
- Output schema: `{score: 0-100, category, reasoning}`
- Không cần memory (single-turn)

### 🎯 Use case C — Compliance Reviewer

> *"Upload hợp đồng → agent tự đọc, đối chiếu với policy, gắn cờ điều khoản nguy hiểm, output báo cáo."*

**Setup**:

- Loại: Task autonomous
- Knowledge: KB "Legal Policy", KB "Past Cases"
- Tools: `document.parse`, `report.generate_pdf`
- Max iterations: 20 (chống loop)
- Output: structured report + xếp severity

---

## 7. Deployment surfaces

1 agent có thể expose qua nhiều "kênh":

| Surface | Mô tả | Phù hợp |
| --- | --- | --- |
| **Chat URL public** | URL `cap.app/chat/<agent_id>` dùng ngay | Demo, internal share |
| **Embed iframe** | `<iframe src="...">` nhúng website công ty | Customer-facing bot |
| **API endpoint** | `POST /api/v1/agents/<id>/invoke` | Tích hợp app khác |
| **Slack / Teams bot** | Mention `@cap-bot` trong channel | Internal team |
| **Mobile SDK** (v3) | iOS / Android SDK | Mobile app |

Mỗi surface có **API Key riêng** (theo [IAM §8.2](/02-domain/02-iam-rbac)) để revoke độc lập.

---

## 8. Cost & quan sát per agent

Mỗi agent có dashboard:

| Metric | Mô tả |
| --- | --- |
| **Conversations / ngày** | Lượt chat |
| **Tokens dùng** | Input + output, split theo model |
| **Chi phí USD** | Tổng cost LLM + tool calls |
| **Latency p50 / p95** | Độ trễ phản hồi |
| **Tool call frequency** | Tool nào được gọi nhiều |
| **Escalation rate** | % cuộc chat bị bot từ chối → người |
| **User feedback** | 👍/👎 cuối câu trả lời |

→ Tổng hợp ra **Quota per agent**: max conversations/giờ, max tokens/ngày — để chặn runaway cost.

---

## 9. Trade-off đã chấp nhận

| Quyết định | Lý do | Đánh đổi |
| --- | --- | --- |
| **Immutable version sau publish** | Reproducibility, A/B, audit | Builder phải learn flow "edit-draft-publish" thay vì "edit-save" |
| **Memory short-term only (MVP)** | Đơn giản, dễ predict cost | Long conversation phải truncate; v2 thêm summary memory |
| **Provider-agnostic giảm tính năng riêng** | Đổi provider không rebuild | Không tận dụng được Anthropic tool calling format đặc thù; phải đồng nhất theo mẫu số chung |
| **1 agent chỉ retrieve từ Knowledge của workspace** | Isolation cứng | Không share KB cross-workspace tới v4 |
| **Safety là deny-list, không ML classifier (MVP)** | Đơn giản, predictable | Bypass dễ hơn so với LLM-based filter; v2 thêm ML layer |

---

## 10. Câu hỏi còn mở

| # | Câu hỏi | Cân nhắc | Phiên bản |
| --- | --- | --- | --- |
| Q1 | **Multi-modal** — agent đầu vào ảnh / audio / video | Phụ thuộc model; v3 cho image, v4 voice | v3-v4 |
| Q2 | **Agent collaboration** — agent gọi agent khác (multi-agent) | Đã có cơ chế Agent-as-Node; cần thêm orchestrator pattern | v2 |
| Q3 | **Long-term memory** (summary + vector) | Cải thiện multi-turn nhưng phức tạp cost | v2 |
| Q4 | **A/B testing UI** | Chia traffic 50/50 giữa 2 version, compare metrics | v3 |
| Q5 | **Clone agent across workspace** (internal marketplace) | Đồng bộ với [IAM §7.2](/02-domain/02-iam-rbac) | v3 |
| Q6 | **Agent template marketplace** (public) | Share template giữa các tenant | v5 |
| Q7 | **Custom fine-tuning per agent** | Fine-tune model với dữ liệu workspace; expensive + complex | Out of MVP scope |

---

## Liên kết

- [Tool](/02-domain/04-tool) — danh sách tool agent có thể gọi
- [Knowledge Base](/02-domain/05-knowledge) — KB agent retrieval
- [Workflow](/02-domain/06-workflow) — agent là 1 loại node
- [Conversation & Run](/02-domain/07-conversation) — agent serve conversation
- [IAM §4.2 Tình huống B](/02-domain/02-iam-rbac) — Service Account gọi agent
- [Vision § 3 — Trao quyền nghiệp vụ](/01-overview/01-vision)
