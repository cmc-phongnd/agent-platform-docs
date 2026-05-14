---
sidebar_position: 5
---

# RAG Pipeline

🔴 Placeholder

## Tham khảo

Tham khảo design của Dify tại [research notes](/08-references/01-dify) — Dify có pipeline RAG hoàn chỉnh nhất trong số 4 sản phẩm tham khảo.

## Pipeline 2 phase

### Phase 1 — Ingest (async)

```
Upload → Extract → Clean → Chunk → Embed → Index
```

### Phase 2 — Retrieval (sync)

```
Query → Embed → Search (semantic / fulltext / hybrid) → Rerank → Top-K → LLM prompt
```

## Components cần thiết kế

- Extractor: PDF, DOCX, HTML, Notion, GDrive, website crawl
- Chunker: Recursive character (Dify-like) + parent-child + QA mode
- Embedding cache (dedup theo hash)
- Vector backend: pgvector (start), Qdrant (scale)
- Rerank model: cross-encoder (BGE / Cohere)
