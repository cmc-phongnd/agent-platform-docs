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

Hệ thống được tổ chức thành **5 lớp chức năng**, mỗi lớp có một trách nhiệm rõ ràng. Cách chia này không phụ thuộc công nghệ cụ thể — nó nói **vai trò trong hệ thống**, không phải sản phẩm cài đặt.

<div className="cap-arch">

<div className="cap-arch__layer cap-arch__layer--clients">
  <div className="cap-arch__layer-header">👤 Người dùng</div>
  <div className="cap-arch__grid cap-arch__grid--clients">
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Web Console</div>
      <div className="cap-arch__node-desc">Builder kéo-thả</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Chat Embed</div>
      <div className="cap-arch__node-desc">iframe / widget</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">SDK / REST</div>
      <div className="cap-arch__node-desc">Hệ thống ngoài tích hợp</div>
    </div>
  </div>
</div>

<div className="cap-arch__arrow">↓</div>

<div className="cap-arch__layer cap-arch__layer--edge">
  <div className="cap-arch__layer-header">🌐 Lớp Edge — Cửa ngõ</div>
  <div className="cap-arch__grid cap-arch__grid--edge">
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Load Balancer + TLS</div>
      <div className="cap-arch__node-desc">Terminate HTTPS, phân tải</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">API Gateway</div>
      <div className="cap-arch__node-desc">Xác thực · rate limit · định tuyến</div>
    </div>
  </div>
</div>

<div className="cap-arch__arrow">↓</div>

<div className="cap-arch__layer cap-arch__layer--app">
  <div className="cap-arch__layer-header">⚙️ Lớp Application — Phần mềm ứng dụng</div>
  <div className="cap-arch__grid cap-arch__grid--app">
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Console API</div>
      <div className="cap-arch__node-desc">Quản trị, builder</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Public API</div>
      <div className="cap-arch__node-desc">Chat, gọi agent</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Workflow Engine</div>
      <div className="cap-arch__node-desc">Điều phối luồng</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Async Worker</div>
      <div className="cap-arch__node-desc">Tác vụ dài</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Scheduler</div>
      <div className="cap-arch__node-desc">Lập lịch, trigger</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Tool Runtime</div>
      <div className="cap-arch__node-desc">Sandbox tool</div>
    </div>
  </div>
</div>

<div className="cap-arch__arrow">↓ &nbsp; ↓ &nbsp; ↓</div>

<div className="cap-arch__row">

<div className="cap-arch__layer cap-arch__layer--data">
  <div className="cap-arch__layer-header">💾 Lớp Data — Dữ liệu</div>
  <div className="cap-arch__grid cap-arch__grid--data">
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Metadata DB</div>
      <div className="cap-arch__node-desc">Cấu hình + RBAC</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Vector DB</div>
      <div className="cap-arch__node-desc">Embedding</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Cache + Khoá</div>
      <div className="cap-arch__node-desc">Phân tán</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Object Storage</div>
      <div className="cap-arch__node-desc">File gốc</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__node-title">Message Queue</div>
      <div className="cap-arch__node-desc">Tác vụ async</div>
    </div>
  </div>
</div>

<div className="cap-arch__layer cap-arch__layer--ext">
  <div className="cap-arch__layer-header">☁️ Lớp External — Kết nối ngoài</div>
  <div className="cap-arch__grid cap-arch__grid--ext">
    <div className="cap-arch__node">
      <div className="cap-arch__sub-title">🧠 Nhà cung cấp AI</div>
      <div className="cap-arch__sub-items">OpenAI · Anthropic · Bedrock · vLLM · Ollama · BGE · Cohere</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__sub-title">💬 Kênh giao tiếp</div>
      <div className="cap-arch__sub-items">Slack · MS Teams · Email · Zalo · Telegram · Webchat</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__sub-title">📄 Tài liệu & lưu trữ</div>
      <div className="cap-arch__sub-items">Google Drive · SharePoint · Notion · OneDrive · Confluence</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__sub-title">🏢 Hệ thống nghiệp vụ</div>
      <div className="cap-arch__sub-items">CRM · ERP · HRM · ITSM · Jira · Salesforce · HubSpot</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__sub-title">🔌 Tích hợp tuỳ biến</div>
      <div className="cap-arch__sub-items">REST · GraphQL · Webhook in/out · MCP servers</div>
    </div>
    <div className="cap-arch__node">
      <div className="cap-arch__sub-title">🔐 Định danh & SSO</div>
      <div className="cap-arch__sub-items">SAML · OAuth · Google · Microsoft · Azure AD</div>
    </div>
  </div>
</div>

</div>

<div className="cap-arch__arrow">↑ &nbsp; ↑ &nbsp; ↑</div>

<div className="cap-arch__layer cap-arch__layer--obs">
  <div className="cap-arch__layer-header">📊 Lớp Observability — Quan sát xuyên suốt</div>
  <div className="cap-arch__node">
    <div className="cap-arch__node-title">Telemetry pipeline</div>
    <div className="cap-arch__node-desc">Mọi service phát trace · log · metric → debug, audit, đo chi phí theo tenant / workspace</div>
  </div>
</div>

<div className="cap-arch__caption">5 lớp chức năng + lớp Observability xuyên suốt — chi tiết kết nối ở 3 sequence diagram bên dưới</div>

</div>

### 1.1 Vai trò 5 lớp

| Lớp | Trách nhiệm chính | Vì sao tách riêng |
| --- | --- | --- |
| **Edge — Cửa ngõ** | Tiếp nhận mọi traffic, kiểm token, chống lạm dụng (rate limit, DDoS), định tuyến đến đúng service | Là điểm vào duy nhất → dễ áp dụng chính sách bảo mật tập trung; không lưu dữ liệu nên nhân bản tự do |
| **Application — Phần mềm ứng dụng** | Nơi sản phẩm "sống": quản trị, builder, chat, điều phối workflow, thực thi tool | Tách thành nhiều service nhỏ để mở rộng độc lập theo loại tải (xem 1.2) |
| **Data — Dữ liệu** | Lưu trữ mọi loại dữ liệu: cấu hình, embedding, cache, file gốc, hàng đợi tác vụ | Mỗi loại dữ liệu có đặc thù riêng (truy vấn quan hệ vs ANN vs blob…) → tách store đúng loại, dễ scale |
| **Observability — Quan sát** | Thu thập trace, log, metric từ mọi service; phục vụ debug, audit, đo chi phí | Là yêu cầu **bắt buộc** cho enterprise (xem nguyên tắc "Quan sát được mặc định" trong [Vision](/01-overview/01-vision)) |
| **External — Kết nối ngoài** | Mọi thứ không thuộc CAP: nhà cung cấp LLM, API tổ chức bên ngoài, MCP server | Tách riêng để có thể đổi provider, tách credential, áp policy outbound |

### 1.2 Trong lớp Application có gì?

Đây là lớp đa dạng nhất — chia thành **6 service** dựa trên **risk profile** và **scaling profile** khác nhau:

| Service | Phục vụ ai | Vì sao tách riêng |
| --- | --- | --- |
| **Console API** | Builder qua Web Console | Low traffic, high privilege (quản trị) — cần audit chặt, không nhất thiết scale lớn |
| **Public API** | End-user và hệ thống ngoài | High traffic, low privilege — cần scale theo lượt chat, tách để bảo vệ Console khỏi spike |
| **Workflow Engine** | Mọi luồng có nhiều bước | Logic nóng nhất — cần tối ưu latency, có state riêng cho mỗi run |
| **Async Worker** | Tác vụ dài (ingest tài liệu, batch) | Không chặn người dùng — chạy nền, scale theo backlog |
| **Scheduler** | Lập lịch định kỳ, trigger sự kiện | Stateful (giữ cron state) — chỉ 1 instance active, có HA |
| **Tool Runtime** | Sandbox chạy công cụ của bên thứ 3 | Cách ly bảo mật — tool không được truy cập DB trực tiếp |

> **Lưu ý cho MVP**: 6 service trên là **logical separation**. Trên hạ tầng thực tế, MVP có thể gộp một số service lại để giảm độ phức tạp vận hành. Chi tiết phasing ở [Section 3 — Services](/03-architecture/01-services).

### 1.3 Trong lớp External có gì?

CAP kết nối ra ngoài qua **6 nhóm tích hợp** — mỗi nhóm có service trong CAP đứng ra gọi, và có chính sách bảo mật / quota riêng:

| Nhóm | Mục đích | Ai trong CAP gọi | Ví dụ |
| --- | --- | --- | --- |
| 🧠 **Nhà cung cấp AI** | Sinh nội dung, embedding, rerank kết quả | Engine (LLM, Rerank); Worker (Embedding khi ingest) | OpenAI, Anthropic, Bedrock, vLLM, Ollama, BGE, Cohere |
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
