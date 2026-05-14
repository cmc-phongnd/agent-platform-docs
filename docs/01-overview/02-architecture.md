---
sidebar_position: 2
---

# Kiến trúc tổng quan

🟡 Draft — v0.2

> Trang này trả lời **3 câu hỏi**:
>
> 1. CAP gồm những mảnh ghép nào?
> 2. Thông tin chạy qua hệ thống như thế nào?
> 3. Đâu là các lựa chọn kiến trúc quan trọng và vì sao?
>
> Chi tiết kỹ thuật (tech stack, scaling, schema, isolation pattern) ở [Section 3 — Architecture](/03-architecture/01-services).

---

## 1. CAP gồm những mảnh ghép nào?

Hệ thống được tổ chức thành **6 lớp chức năng**, mỗi lớp có một trách nhiệm rõ ràng. Cách chia này không phụ thuộc công nghệ cụ thể — nó nói **vai trò trong hệ thống**, không phải sản phẩm cài đặt.

```mermaid
%%{init: {'flowchart': {'defaultRenderer': 'elk'}}}%%
flowchart TB
    subgraph CLIENT[👤 Người dùng]
        direction LR
        WEB[Web Console<br/>builder kéo-thả]
        EMBED[Chat Embed<br/>iframe / widget]
        SDK[SDK / REST<br/>hệ thống ngoài]
    end

    subgraph EDGE[🌐 Edge — Cửa ngõ]
        direction LR
        LB[Load Balancer + TLS]
        GW[API Gateway<br/>xác thực · rate limit · định tuyến]
    end

    subgraph CORE[ ]
        direction LR
        subgraph LEFT[ ]
            direction TB
            subgraph APP[⚙️ Application — Phần mềm ứng dụng]
                direction LR
                CONSOLE[Console API<br/>quản trị, builder]
                PUBLIC[Public API<br/>chat, gọi agent]
                ENGINE[Workflow Engine<br/>điều phối luồng]
                WORKER[Async Worker<br/>tác vụ dài]
                SCHED[Scheduler<br/>lập lịch, trigger]
                TOOL[Tool Runtime<br/>sandbox tool]
            end
            subgraph LOWER[ ]
                direction LR
                subgraph DATA[💾 Data — Dữ liệu]
                    direction TB
                    PG[(Metadata DB<br/>cấu hình + RBAC)]
                    VDB[(Vector DB<br/>embedding)]
                    REDIS[(Cache + Khoá phân tán)]
                    BLOB[(Object Storage<br/>file gốc)]
                    MQ[(Message Queue<br/>tác vụ async)]
                end
                subgraph AI[🧠 AI Providers — Trí tuệ]
                    direction TB
                    LLM[LLM — Sinh nội dung<br/>OpenAI · Anthropic · Bedrock · vLLM · Ollama]
                    EMBED_API[Embedding — Mã hoá vector<br/>OpenAI · BGE · Cohere · Voyage]
                    RERANK[Reranker — Xếp lại kết quả<br/>Cohere · BGE-rerank · Jina]
                end
            end
        end
        subgraph EXT[☁️ External — Tích hợp ngoài]
            direction TB
            CHAT[💬 Kênh giao tiếp<br/>Slack · Teams · Email · Zalo]
            DOCS[📄 Tài liệu lưu trữ<br/>Drive · SharePoint · Notion]
            BIZ[🏢 Hệ thống nghiệp vụ<br/>CRM · ERP · HRM · Jira]
            CUSTOM[🔌 Tích hợp tuỳ biến<br/>REST · Webhook · MCP]
            IDP[🔐 Định danh SSO<br/>SAML · OAuth · Google · Microsoft]
        end
    end

    subgraph OBS[📊 Observability — Quan sát xuyên suốt]
        OTEL[Telemetry pipeline<br/>trace + log + metric]
    end

    WEB --> LB
    EMBED --> LB
    SDK --> LB
    LB --> GW
    GW --> CONSOLE
    GW --> PUBLIC
    GW --> IDP
    PUBLIC --> ENGINE

    ENGINE --> TOOL
    ENGINE -.đọc/ghi.-> PG
    ENGINE -.cache.-> REDIS
    ENGINE -.tra cứu.-> VDB
    ENGINE -.phát.-> MQ

    WORKER <-.tiêu thụ.-> MQ
    WORKER -.upsert.-> VDB
    WORKER -.đọc.-> BLOB
    CONSOLE -.lưu.-> PG
    SCHED -.phát.-> MQ

    ENGINE --> LLM
    ENGINE --> RERANK
    WORKER --> EMBED_API

    TOOL --> CHAT
    TOOL --> DOCS
    TOOL --> BIZ
    TOOL --> CUSTOM

    APP -.phát telemetry.-> OBS

    classDef clientStyle fill:#f9fafb,stroke:#6b7280,color:#374151
    classDef edgeStyle fill:#eff6ff,stroke:#3b82f6,color:#1e40af
    classDef appStyle fill:#fffbeb,stroke:#f59e0b,color:#b45309
    classDef aiStyle fill:#ecfeff,stroke:#06b6d4,color:#0e7490
    classDef dataStyle fill:#ecfdf5,stroke:#10b981,color:#047857
    classDef extStyle fill:#fef2f2,stroke:#ef4444,color:#b91c1c
    classDef obsStyle fill:#faf5ff,stroke:#8b5cf6,color:#6d28d9
    classDef wrapper fill:none,stroke:none,color:transparent

    class CLIENT clientStyle
    class EDGE edgeStyle
    class APP appStyle
    class AI aiStyle
    class DATA dataStyle
    class EXT extStyle
    class OBS obsStyle
    class CORE,LEFT,LOWER wrapper
```
![Sơ đồ kiến trúc](/diagrams/arch-overview.svg)

### 1.1 Vai trò 6 lớp

| Lớp | Trách nhiệm chính | Vì sao tách riêng |
| --- | --- | --- |
| **Edge — Cửa ngõ** | Tiếp nhận mọi traffic, kiểm token, chống lạm dụng (rate limit, DDoS), định tuyến đến đúng service | Là điểm vào duy nhất → dễ áp dụng chính sách bảo mật tập trung; không lưu dữ liệu nên nhân bản tự do |
| **Application — Phần mềm ứng dụng** | Nơi sản phẩm "sống": quản trị, builder, chat, điều phối workflow, thực thi tool | Tách thành nhiều service nhỏ để mở rộng độc lập theo loại tải (xem 1.2) |
| **AI Providers — Trí tuệ** | Mô hình ngôn ngữ (LLM), mã hoá vector (embedding), xếp lại kết quả (rerank) | Tách riêng khỏi External vì là **lõi nghiệp vụ AI** — chiếm phần lớn chi phí, được Engine/Worker gọi xuyên suốt mọi luồng (xem 1.3) |
| **Data — Dữ liệu** | Lưu trữ mọi loại dữ liệu: cấu hình, embedding, cache, file gốc, hàng đợi tác vụ | Mỗi loại dữ liệu có đặc thù riêng (truy vấn quan hệ vs ANN vs blob…) → tách store đúng loại, dễ scale |
| **External — Tích hợp ngoài** | Hệ thống của khách hàng và bên thứ 3 mà CAP cần kết nối: chat, lưu trữ, ERP/CRM, MCP, SSO | Tách riêng để áp policy outbound, đổi tích hợp dễ, không nhầm với AI lõi (xem 1.4) |
| **Observability — Quan sát** | Thu thập trace, log, metric từ mọi service; phục vụ debug, audit, đo chi phí | Là yêu cầu **bắt buộc** cho enterprise (xem nguyên tắc "Quan sát được mặc định" trong [Vision](/01-overview/01-vision)) |

### 1.2 Trong lớp Application có gì?

Đây là lớp đa dạng nhất — chia thành **6 service** dựa trên **risk profile** và **scaling profile** khác nhau. Quan hệ gọi giữa các service:

```mermaid
flowchart LR
    Console[Console API] -.lưu cấu hình.-> PG[(Metadata DB)]
    Public[Public API] -->|chat / invoke| Engine[Workflow Engine]
    Engine -->|gọi tool| Tool[Tool Runtime]
    Sched[Scheduler] -.publish.-> MQ[(Message Queue)]
    MQ -.consume.-> Worker[Async Worker]

    style Console fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style Public fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style Engine fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style Worker fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style Sched fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style Tool fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style PG fill:#ecfdf5,stroke:#10b981,color:#047857
    style MQ fill:#ecfdf5,stroke:#10b981,color:#047857
```

> 🔑 Hai nhóm rõ rệt: **sync** (`Public → Engine → Tool` cho mỗi lượt chat) và **async** (`Scheduler → MQ → Worker` cho tác vụ nền). Console hoạt động độc lập, chủ yếu là CRUD vào Metadata DB.

| Service | Phục vụ ai | Vì sao tách riêng |
| --- | --- | --- |
| **Console API** | Builder qua Web Console | Low traffic, high privilege (quản trị) — cần audit chặt, không nhất thiết scale lớn |
| **Public API** | End-user và hệ thống ngoài | High traffic, low privilege — cần scale theo lượt chat, tách để bảo vệ Console khỏi spike |
| **Workflow Engine** | Mọi luồng có nhiều bước | Logic nóng nhất — cần tối ưu latency, có state riêng cho mỗi run |
| **Async Worker** | Tác vụ dài (ingest tài liệu, batch) | Không chặn người dùng — chạy nền, scale theo backlog |
| **Scheduler** | Lập lịch định kỳ, trigger sự kiện | Stateful (giữ cron state) — chỉ 1 instance active, có HA |
| **Tool Runtime** | Sandbox chạy công cụ của bên thứ 3 | Cách ly bảo mật — tool không được truy cập DB trực tiếp |

> **Lưu ý cho MVP**: 6 service trên là **logical separation**. Trên hạ tầng thực tế, MVP có thể gộp một số service lại để giảm độ phức tạp vận hành. Chi tiết phasing ở [Section 3 — Services](/03-architecture/01-services).

### 1.3 Trong lớp AI Providers có gì?

Đây là **lõi nghiệp vụ AI** — tách ra khỏi External vì chiếm phần lớn chi phí vận hành và được gọi xuyên suốt mọi luồng. Mỗi workspace tự cấu hình provider và model muốn dùng.

```mermaid
flowchart LR
    Engine[Workflow Engine] -->|sinh response,<br/>gọi tool| LLM[LLM]
    Engine -->|sau retrieval,<br/>xếp top-K| Rerank[Reranker]
    Engine -->|embed query<br/>người dùng| Embed[Embedding]
    Worker[Async Worker] -->|embed chunk<br/>khi ingest| Embed

    style Engine fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style Worker fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style LLM fill:#ecfeff,stroke:#06b6d4,color:#0e7490
    style Rerank fill:#ecfeff,stroke:#06b6d4,color:#0e7490
    style Embed fill:#ecfeff,stroke:#06b6d4,color:#0e7490
```

> 🔑 Embedding được **2 nơi gọi** (Engine cho query người dùng, Worker cho chunk lúc ingest) — đó là lý do nó luôn được cache theo hash text, tránh re-embed cùng nội dung.

| Loại | Mục đích | Ai trong CAP gọi | Ví dụ |
| --- | --- | --- | --- |
| **LLM — Sinh nội dung** | Tạo câu trả lời, gọi tool, phân tích văn bản | Workflow Engine (mỗi lượt chat hoặc node LLM trong workflow) | OpenAI · Anthropic · Bedrock · Google Vertex · vLLM · Ollama |
| **Embedding — Mã hoá vector** | Biến văn bản thành vector để retrieval | Async Worker (lúc ingest tài liệu) · Engine (lúc nhận query người dùng) | OpenAI · BGE · Cohere · Voyage |
| **Reranker — Xếp lại kết quả** | Sắp xếp lại top-K từ vector search để tăng độ chính xác | Workflow Engine (sau retrieval, trước khi đưa vào prompt) | Cohere · BGE-rerank · Jina |

> **Nguyên tắc đổi provider**: lớp gọi AI được trừu tượng hoá — đổi provider không phải xây lại agent (xem [Vision § 3.4](/01-overview/01-vision)). Credential mỗi tenant riêng, mã hoá tại nơi lưu trữ.

### 1.4 Trong lớp External có gì?

External là **các hệ thống của khách hàng và bên thứ 3** — CAP gọi ra để lấy/ghi dữ liệu nghiệp vụ hoặc đẩy thông báo. Mỗi nhóm có service trong CAP đứng ra gọi và áp policy riêng:

```mermaid
flowchart LR
    GW[API Gateway] -->|xác thực| IDP[🔐 Định danh & SSO]
    Tool[Tool Runtime] --> Chat[💬 Kênh giao tiếp]
    Tool --> Docs[📄 Tài liệu & lưu trữ]
    Tool --> Biz[🏢 Hệ thống nghiệp vụ]
    Tool --> Custom[🔌 Tích hợp tuỳ biến]

    style GW fill:#eff6ff,stroke:#3b82f6,color:#1e40af
    style Tool fill:#fffbeb,stroke:#f59e0b,color:#b45309
    style IDP fill:#fef2f2,stroke:#ef4444,color:#b91c1c
    style Chat fill:#fef2f2,stroke:#ef4444,color:#b91c1c
    style Docs fill:#fef2f2,stroke:#ef4444,color:#b91c1c
    style Biz fill:#fef2f2,stroke:#ef4444,color:#b91c1c
    style Custom fill:#fef2f2,stroke:#ef4444,color:#b91c1c
```

> 🔑 **2 đường gọi External khác nhau**: SSO/Identity gọi từ **API Gateway** (lúc xác thực, chưa vào hệ thống); 4 nhóm còn lại gọi qua **Tool Runtime** (sandbox cách ly, không cho tool truy cập DB).

| Nhóm | Mục đích | Ai trong CAP gọi | Ví dụ |
| --- | --- | --- | --- |
| 💬 **Kênh giao tiếp** | Tiếp nhận tin nhắn từ user hoặc gửi notification đi | Tool Runtime (qua tool tương ứng) | Slack, MS Teams, Email, Zalo, Telegram, Webchat |
| 📄 **Tài liệu & lưu trữ** | Nguồn tri thức cho RAG; ghi kết quả ra cloud | Tool Runtime (gọi tool); Worker (đồng bộ định kỳ) | Google Drive, SharePoint, Notion, OneDrive, Confluence |
| 🏢 **Hệ thống nghiệp vụ** | Tra cứu / ghi dữ liệu nghiệp vụ của tổ chức | Tool Runtime | CRM, ERP, HRM, ITSM, Jira, Salesforce, HubSpot |
| 🔌 **Tích hợp tuỳ biến** | Mở rộng không giới hạn theo API của khách hàng | Tool Runtime; Public API (webhook inbound) | REST/GraphQL, Webhook in/out, MCP servers |
| 🔐 **Định danh & SSO** | Đăng nhập một lần, đồng bộ user từ identity provider | API Gateway (lúc xác thực) | SAML, OAuth, Google, Microsoft, Azure AD |

> **Nguyên tắc gọi ngoài**: mọi credential gọi External đều được **mã hoá tại nơi lưu trữ**, mỗi tenant có credential riêng, log gọi External không lưu nội dung secret. Chi tiết ở [Section 3 — Tool Runtime](/03-architecture/04-tool-runtime).

---

## 2. Thông tin chạy qua hệ thống như thế nào?

Toàn bộ CAP tóm gọn trong **3 luồng dữ liệu**. Hiểu 3 luồng này là hiểu cách CAP vận hành.

### 2.1 Luồng "Xây dựng" — builder định nghĩa agent / workflow

Khi một builder kéo-thả workflow trong Web Console và lưu lại, điều gì xảy ra?

```mermaid
sequenceDiagram
    actor B as Builder
    participant W as Web Console
    participant GW as API Gateway
    participant C as Console API
    participant PG as Metadata DB
    participant BL as Object Storage

    B->>W: Kéo-thả các node
    W->>GW: POST /workflows (kèm JWT)
    GW->>GW: Xác thực + rate limit
    GW->>C: Chuyển tiếp
    C->>C: Validate sơ đồ, kiểm RBAC
    C->>PG: Lưu workflow + danh sách node
    C->>BL: Upload icon/avatar (nếu có)
    C-->>W: 201 workflow_id
    W-->>B: Hiển thị thành công
```

**Đặc điểm**: luồng nhẹ — không chạm Engine, Worker, Queue. Builder cảm nhận **gần như tức thì**.

### 2.2 Luồng "Vận hành" — end-user chat với agent

Đây là luồng nóng nhất, được tối ưu để giảm độ trễ.

```mermaid
sequenceDiagram
    actor U as End User
    participant W as Embed Widget
    participant GW as API Gateway
    participant P as Public API
    participant E as Workflow Engine
    participant TR as Tool Runtime
    participant V as Vector DB
    participant L as Nhà cung cấp LLM

    U->>W: Gửi câu hỏi
    W->>GW: POST /chat (kèm API key)
    GW->>P: Chuyển tiếp
    P->>E: Gọi agent
    E->>E: Đọc cấu hình agent, dựng prompt
    E->>V: Truy hồi tài liệu liên quan (RAG)
    V-->>E: Trả về các đoạn văn
    E->>L: Gọi LLM (kèm danh sách tool)
    L-->>E: LLM yêu cầu gọi tool
    E->>TR: Thực thi tool trong sandbox
    TR-->>E: Kết quả tool
    E->>L: Gọi LLM lần 2 (kèm kết quả tool)
    L-->>E: Câu trả lời cuối
    E-->>P: Phản hồi
    P-->>W: Stream từng token về (SSE)
    W-->>U: Hiển thị
```

**Đặc điểm chính**:

- **Cache mạnh** ở mỗi bước có thể cache (system prompt, embedding của câu hỏi quen thuộc) → giảm chi phí + giảm độ trễ
- **Stream** từng token thay vì chờ trả lời đầy đủ → trải nghiệm "đang gõ"
- **Có thể nhiều vòng tool call** trước khi LLM ra câu trả lời cuối

### 2.3 Luồng "Nạp tri thức" — upload tài liệu → sẵn sàng tra cứu

Khi builder upload PDF/DOCX vào Knowledge Base, hệ thống không xử lý đồng bộ (sẽ rất chậm), mà chuyển sang nền:

```mermaid
sequenceDiagram
    actor B as Builder
    participant W as Web Console
    participant C as Console API
    participant BL as Object Storage
    participant MQ as Message Queue
    participant WK as Async Worker
    participant E as Embedding API
    participant V as Vector DB
    participant PG as Metadata DB

    B->>W: Upload PDF
    W->>C: POST /documents
    C->>BL: Lưu file gốc
    C->>PG: Tạo bản ghi document (status=chờ xử lý)
    C->>MQ: Phát task ingest
    C-->>W: 202 Đã nhận
    Note over W: Builder không phải chờ

    MQ-->>WK: Tiêu thụ task
    WK->>BL: Đọc file
    WK->>WK: Bóc tách → làm sạch → cắt đoạn
    WK->>PG: Lưu các đoạn (segment)
    WK->>E: Tính embedding cho từng đoạn
    E-->>WK: Vector
    WK->>V: Lưu vector vào index
    WK->>PG: Cập nhật status=hoàn tất
```

**Đặc điểm chính**:

- **Bất đồng bộ hoàn toàn** — builder upload xong là quay về làm việc khác; có thể polling trạng thái hoặc nhận webhook khi xong
- **Có thể mất vài phút** với tài liệu lớn — đó là lý do tách Worker ra khỏi đường nóng
- **Mỗi bước đều có thể retry** mà không ảnh hưởng các tài liệu khác

---

## 3. Đâu là các lựa chọn kiến trúc quan trọng?

Phần này không liệt kê tech stack. Phần này nói **những đánh đổi đã chấp nhận** ở cấp nghiệp vụ, và lý do.

### 3.1 Tách cứng dữ liệu giữa các tenant

| Quyết định | Đảm bảo điều gì | Đánh đổi |
| --- | --- | --- |
| Mọi bảng dữ liệu, mọi vector collection, mọi bucket lưu trữ đều có khóa định danh tenant. Truy vấn không có khoá tenant **bị chặn ở tầng repository**, không phụ thuộc lập trình viên nhớ filter | Không có cách nào một workspace của khách A nhìn được dữ liệu của khách B, kể cả khi có bug | Khi muốn share resource giữa các workspace (vd KB dùng chung), cần thiết kế cơ chế share rõ ràng — không thể "vô tình" share |

→ Chi tiết kỹ thuật ở [Section 3 — Multi-tenant Isolation](/03-architecture/06-multi-tenant).

### 3.2 Cách ly công cụ khỏi nhân hệ thống (sandbox)

| Quyết định | Đảm bảo điều gì | Đánh đổi |
| --- | --- | --- |
| Mọi tool (built-in, custom REST, MCP, workflow-as-tool) chạy trong Tool Runtime tách rời, **không có quyền truy cập DB của CAP**. Có giới hạn thời gian, tài nguyên, network | Một tool lỗi hoặc độc không thể "đào" vào dữ liệu hệ thống. Có thể chấp nhận tool do người dùng tự cung cấp | Thêm độ phức tạp triển khai; tool muốn dùng dữ liệu CAP phải gọi qua API có xác thực |

→ Chi tiết ở [Section 3 — Tool Runtime](/03-architecture/04-tool-runtime).

### 3.3 Mọi hành động đều có dấu vết

| Quyết định | Đảm bảo điều gì | Đánh đổi |
| --- | --- | --- |
| Mọi service đều phát trace, log, metric theo chuẩn OpenTelemetry. Mỗi LLM call, mỗi tool call đều ghi: ai gọi, gọi gì, hết bao nhiêu token, hết bao nhiêu tiền | Khi có sự cố — debug được. Khi cần audit — có log đầy đủ. Khi tính chi phí — chia được theo tenant/workspace/agent | Chi phí lưu trữ telemetry không nhỏ; cần chiến lược retention rõ ràng |

→ Chi tiết ở [Section 3 — Observability](/03-architecture/08-observability).

### 3.4 Không khoá vào một nhà cung cấp LLM

| Quyết định | Đảm bảo điều gì | Đánh đổi |
| --- | --- | --- |
| Lớp gọi LLM được trừu tượng hoá. CAP hỗ trợ OpenAI-compatible API, Anthropic, Bedrock, và mô hình local. Mỗi workspace tự chọn provider | Khách hàng đổi provider mà **không phải xây lại agent**. Có thể chạy hỗn hợp: agent nhạy cảm dùng LLM nội bộ, agent thường dùng cloud | Không tận dụng được các tính năng đặc thù của 1 provider (vd tool calling format riêng) — phải đồng nhất theo mẫu số chung |

### 3.5 Bắt đầu đơn giản, có lối thoát để mở rộng

| Quyết định | Đảm bảo điều gì | Đánh đổi |
| --- | --- | --- |
| MVP triển khai một số service gộp lại (monolith), một số chỗ làm phiên bản đơn giản (workflow engine in-process, cache + queue dùng Redis). Mọi chỗ "đơn giản" đều có **interface trừu tượng** để swap sang phiên bản production-grade (Temporal, NATS, Qdrant) khi cần | MVP nhẹ, vận hành đơn giản, đội kỹ thuật nhỏ vẫn làm được. Khi quy mô tăng — đổi từng mảnh, không phải viết lại | Cần kỷ luật thiết kế ngay từ đầu để mỗi mảnh có thể swap; lúc swap có chi phí migration |

→ Chi tiết phasing ở [Section 3 — Services](/03-architecture/01-services).

---

## 4. Cách ly đa tenant (tóm tắt)

Mỗi lớp data có cơ chế cách ly riêng, đảm bảo "không cách nào lẫn lộn dữ liệu":

| Lớp data | Cơ chế cách ly |
| --- | --- |
| Metadata DB | Mọi bảng có cột `tenant_id` + `workspace_id`, query luôn filter ở tầng repository |
| Vector DB | Tách collection theo `(tenant_id, workspace_id)` hoặc metadata filter cứng |
| Object Storage | Prefix theo `tenant_id/workspace_id/...` — quyền IAM áp theo prefix |
| Cache / Queue | Key/subject prefix theo tenant — vừa cách ly vừa giúp throttle theo tenant |
| Compute | MVP dùng chung node; gói enterprise có thể dedicated node |

→ Trade-off chi tiết (row-level vs schema-per-tenant vs DB-per-tenant) ở [Section 3 — Multi-tenant](/03-architecture/06-multi-tenant).

---

## 5. Cấu trúc tài liệu liên quan

| Bạn muốn hiểu | Đọc tiếp |
| --- | --- |
| Khái niệm nghiệp vụ (Tenant, Workspace, Agent, Tool, Knowledge…) | [Section 2 — Domain](/02-domain/01-tenant-workspace) |
| Thiết kế chi tiết từng service, từng store, isolation, observability | [Section 3 — Architecture](/03-architecture/01-services) |
| Đặc tả API (Console + Public) | [Section 4 — API](/04-api/01-conventions) |
| Giao diện builder, workflow editor | [Section 5 — Frontend](/05-frontend/01-app-shell) |
| Triển khai dev, staging, production | [Section 6 — Deployment](/06-deployment/01-dev-env) |
| Lộ trình tính năng theo phiên bản | [Section 7 — Roadmap](/07-roadmap/01-mvp) |

---

> **Phạm vi của trang này**: tổng quan để **mọi đối tượng đọc đều nắm được hình hài hệ thống**. Mọi quyết định tech stack cụ thể (FastAPI hay NestJS, NATS hay RabbitMQ, pgvector hay Qdrant…) đều ở [Section 3 — Architecture](/03-architecture/01-services). Khi nội dung kỹ thuật phình lên ở Section 3, **trang này không cần dài hơn**.
