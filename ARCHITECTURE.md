# ARCHITECTURE.md

# AI-Native Personal Knowledge & Thinking Environment

**Version:** 1.0  
**Status:** Implementation Specification  
**Date:** August 2026  
**Audience:** Engineering team, coding agents, architects  
**Companion document:** `PRD.md`

---

# 1. Purpose

This document defines the technical architecture for the AI-native personal knowledge and thinking environment described in `PRD.md`.

The architecture must support:

- Atomic notes and blocks
- Knowledge concepts and entities
- Typed relationships
- Relationship confidence and strength
- Evidence and provenance
- Perspectives
- Knowledge graph visualization
- Infinite spatial canvas
- Semantic and hybrid search
- GraphRAG
- Multimodal ingestion
- AI agents
- Knowledge evolution
- Active recall
- Local-first operation
- Multiple AI providers
- Local and cloud inference
- Provider failover
- Import/export
- Future CRDT-based collaboration

The central architectural principle is:

> **The knowledge core must be independent from the AI provider, visualization layer, and deployment environment.**

---

# 2. Architectural Principles

## 2.1 Knowledge is the source of truth

The user's knowledge must be stored independently of AI outputs.

AI-generated information is metadata, inference, suggestion, or derived knowledge.

Never make an LLM response the authoritative representation of the user's notes.

---

## 2.2 AI providers are replaceable

The application must not contain business logic such as:

```typescript
if (provider === "openai") {
   ...
}
```

throughout the codebase.

Instead:

```text
Application
    ↓
AI Gateway
    ↓
Provider Interface
    ↓
Provider Adapter
    ↓
Model
```

---

## 2.3 Local-first

The application should function without a cloud AI provider.

Minimum offline capabilities:

- Create notes
- Edit notes
- Create blocks
- Search
- Browse graph
- Use canvas
- Create manual relationships
- Export
- Run local embeddings
- Run local LLMs where available

---

## 2.4 Derived data is rebuildable

The following should be considered derived:

- Embeddings
- AI summaries
- AI classifications
- AI relationship candidates
- Cluster labels
- Search indexes
- AI-generated perspectives
- Flashcards

The system must be able to regenerate them.

---

## 2.5 Provenance everywhere

AI-generated information must be traceable back to:

```text
Knowledge object
→ Block
→ Source
→ Location
→ Model
→ Prompt version
→ Timestamp
```

---

## 2.6 Human control

AI should suggest before making destructive changes.

Default behavior:

```text
AI
 ↓
Suggestion
 ↓
User approval
 ↓
Persistent knowledge change
```

---

# 3. System Overview

```text
┌───────────────────────────────────────────────────────────────┐
│                         CLIENTS                               │
│                                                               │
│  Desktop Web │ Mobile │ Browser Extension │ CLI │ API Client │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                         API / BFF                             │
│                                                               │
│ Auth │ Notes │ Blocks │ Graph │ Canvas │ Search │ AI │ Files │
└──────────────────────────────┬────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
       │ Knowledge   │  │ AI Gateway   │  │ Job System   │
       │ Core        │  │             │  │              │
       └──────┬──────┘  └──────┬──────┘  └──────┬───────┘
              │                │                │
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌──────────────┐
       │ PostgreSQL  │  │ AI Providers │  │ Redis/Queue  │
       │ + pgvector  │  │             │  │              │
       └─────────────┘  └─────────────┘  └──────────────┘
                               │
          ┌────────────────────┼────────────────────────┐
          ▼                    ▼                        ▼
       OpenAI                Claude                   Ollama
          │                    │                        │
       Gemini               NVIDIA              Local Models
          │                    │                        │
          └────────────────────┼────────────────────────┘
                               │
                               ▼
                         AI Model Layer
```

---

# 4. Recommended Technology Stack

## 4.1 Frontend

Recommended:

```text
React
TypeScript
Vite
Tailwind CSS
Zustand
React Router
TipTap / ProseMirror
React Flow / XYFlow
```

For the canvas:

```text
React Flow / XYFlow
```

or a dedicated canvas engine if performance requirements later exceed it.

---

# 4.2 Backend

Recommended:

```text
TypeScript
Node.js
Fastify
Zod
PostgreSQL
pgvector
Redis
BullMQ
```

Alternative:

```text
Python
FastAPI
Celery
PostgreSQL
```

However, TypeScript is recommended for the MVP because the frontend and backend can share:

- Types
- Validation schemas
- API contracts
- AI schemas

---

# 4.3 Database

Primary:

```text
PostgreSQL
```

Extensions:

```text
pgvector
pg_trgm
uuid-ossp or native UUID support
```

PostgreSQL + vector search is a reasonable MVP architecture because it keeps metadata, graph relationships, and vector data in one consistency boundary. Current 2026 research also continues to investigate unified PostgreSQL/vector architectures for production RAG workloads.

---

# 4.4 Cache / Queue

```text
Redis
BullMQ
```

Used for:

- AI jobs
- Embedding jobs
- PDF processing
- Transcription
- Relationship discovery
- Agent execution
- Notifications
- Retry handling

---

# 4.5 Object Storage

Abstract storage interface:

```text
ObjectStorage
```

Implementations:

```text
Local filesystem
S3
MinIO
Cloudflare R2
AWS S3
Backblaze B2
```

The application must never directly depend on an S3 SDK outside the storage adapter.

---

# 5. Repository Structure

Recommended monorepo:

```text
knowledge-os/
│
├── apps/
│   ├── web/
│   ├── mobile/
│   ├── api/
│   └── worker/
│
├── packages/
│   ├── domain/
│   ├── database/
│   ├── ai/
│   ├── search/
│   ├── graph/
│   ├── canvas/
│   ├── ingestion/
│   ├── storage/
│   ├── auth/
│   ├── events/
│   ├── schemas/
│   └── shared/
│
├── migrations/
├── scripts/
├── tests/
├── docker/
├── docs/
│
├── PRD.md
├── ARCHITECTURE.md
└── package.json
```

---

# 6. Domain Architecture

The core domain consists of:

```text
Workspace
    │
    ├── Knowledge Objects
    │       ├── Notes
    │       ├── Blocks
    │       ├── Concepts
    │       ├── Entities
    │       ├── Sources
    │       ├── Documents
    │       ├── Media
    │       └── Projects
    │
    ├── Relationships
    │
    ├── Perspectives
    │
    ├── Canvases
    │
    └── AI Configuration
```

---

# 7. Core Entity Model

The minimum core entities are:

```text
users
workspaces
notes
blocks
concepts
entities
sources
attachments
relationships
relationship_evidence
perspectives
perspective_relationship_scores
canvases
canvas_nodes
canvas_edges
embeddings
ai_providers
ai_models
ai_jobs
ai_runs
agents
agent_runs
knowledge_events
flashcards
review_events
```

---

# 8. User

```sql
users
```

Fields:

```text
id UUID PRIMARY KEY
email
display_name
created_at
updated_at
```

Authentication should be isolated from knowledge-domain logic.

---

# 9. Workspace

```sql
workspaces
```

Fields:

```text
id UUID PRIMARY KEY
owner_id UUID
name TEXT
slug TEXT
settings JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

A user may eventually belong to multiple workspaces.

---

# 10. Note

```sql
notes
```

Fields:

```text
id UUID PRIMARY KEY
workspace_id UUID
title TEXT
slug TEXT
note_type TEXT
content_format TEXT
status TEXT
created_at TIMESTAMP
updated_at TIMESTAMP
deleted_at TIMESTAMP NULL
metadata JSONB
```

Possible `note_type`:

```text
fleeting
literature
permanent
project
daily
reference
```

---

# 11. Block

Blocks are first-class knowledge objects.

```sql
blocks
```

Fields:

```text
id UUID PRIMARY KEY
workspace_id UUID
note_id UUID
parent_block_id UUID NULL
content TEXT
block_type TEXT
position NUMERIC
depth INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
deleted_at TIMESTAMP NULL
metadata JSONB
```

Block types:

```text
paragraph
heading
bullet
ordered_list
quote
code
image
embed
callout
table
divider
```

---

# 12. Block Identity

Block IDs must remain stable when block content changes.

Example:

```text
block_01JABC...
```

This allows:

```text
((block_01JABC...))
```

to continue working after editing.

---

# 13. Block References

A block reference is stored separately.

```sql
block_references
```

Fields:

```text
id UUID
source_block_id UUID
target_block_id UUID
reference_type TEXT
created_at TIMESTAMP
```

Types:

```text
reference
embed
transclusion
```

---

# 14. Concept

Concepts represent abstract ideas.

```sql
concepts
```

Fields:

```text
id UUID PRIMARY KEY
workspace_id UUID
canonical_name TEXT
description TEXT
concept_type TEXT
confidence NUMERIC(5,4)
created_at TIMESTAMP
updated_at TIMESTAMP
metadata JSONB
```

Example:

```text
CPU Scheduling
```

---

# 15. Concept Aliases

```sql
concept_aliases
```

Example:

```text
CPU scheduler
CPU scheduling
process scheduling
task scheduling
```

All may map to:

```text
concept_id = X
```

---

# 16. Entities

Entities represent identifiable things.

Examples:

```text
Linux
PostgreSQL
OpenAI
TCP
NVIDIA
Claude
```

Fields:

```text
id
workspace_id
name
entity_type
description
external_id
metadata
```

---

# 17. Sources

```sql
sources
```

Fields:

```text
id UUID
workspace_id UUID
source_type TEXT
title TEXT
url TEXT NULL
author TEXT NULL
publisher TEXT NULL
published_at TIMESTAMP NULL
metadata JSONB
created_at TIMESTAMP
```

Source types:

```text
article
book
paper
video
podcast
course
documentation
conversation
website
personal
```

---

# 18. Attachments

```sql
attachments
```

Fields:

```text
id UUID
workspace_id UUID
storage_key TEXT
filename TEXT
mime_type TEXT
size_bytes BIGINT
checksum TEXT
source_id UUID NULL
metadata JSONB
created_at TIMESTAMP
```

---

# 19. Attachment Processing

Processing state:

```text
pending
processing
completed
failed
```

Metadata may include:

```text
page_count
duration
dimensions
ocr_status
transcription_status
```

---

# 20. Claims

A claim is a statement extracted from knowledge.

```sql
claims
```

Fields:

```text
id UUID
workspace_id UUID
block_id UUID
claim_text TEXT
claim_type TEXT
confidence NUMERIC(5,4)
created_at TIMESTAMP
updated_at TIMESTAMP
```

This allows relationship reasoning at a more granular level.

---

# 21. Relationships

```sql
relationships
```

Fields:

```text
id UUID PRIMARY KEY
workspace_id UUID

source_type TEXT
source_id UUID

target_type TEXT
target_id UUID

relationship_type TEXT

strength NUMERIC(5,4)
confidence NUMERIC(5,4)

origin TEXT

status TEXT

created_by_user_id UUID NULL
ai_run_id UUID NULL

created_at TIMESTAMP
updated_at TIMESTAMP
last_confirmed_at TIMESTAMP NULL
deleted_at TIMESTAMP NULL

metadata JSONB
```

---

# 22. Relationship Origin

Allowed:

```text
user
ai
import
system
inferred
```

---

# 23. Relationship Status

```text
suggested
accepted
rejected
active
deprecated
superseded
```

AI-generated relationships should normally begin as:

```text
suggested
```

unless the user explicitly enables automatic relationship creation.

---

# 24. Relationship Types

Initial enum:

```text
RELATED_TO
EXPLAINS
EXAMPLE_OF
PART_OF
DEPENDS_ON
CAUSES
CONTRADICTS
SUPPORTS
SIMILAR_TO
DERIVED_FROM
IMPLEMENTS
EXTENDS
PRECEDES
REQUIRES
USES
APPLIES_TO
```

Do not hard-code the system so adding a relationship type requires a database migration.

Relationship types should eventually be configurable.

---

# 25. Relationship Evidence

```sql
relationship_evidence
```

Fields:

```text
id UUID
relationship_id UUID

source_type TEXT
source_id UUID

evidence_type TEXT

quote TEXT NULL
start_offset INTEGER NULL
end_offset INTEGER NULL

page_number INTEGER NULL
timestamp_start FLOAT NULL
timestamp_end FLOAT NULL

relevance NUMERIC(5,4)

created_at TIMESTAMP
```

This allows:

```text
Relationship
   ↓
Evidence
   ↓
Exact block/page/timestamp
```

---

# 26. Relationship Scoring

The system must not equate embedding similarity with relationship strength.

Use multiple signals.

Recommended model:

```text
relationship_score =
    semantic_score       * 0.25
  + lexical_score        * 0.05
  + graph_score          * 0.15
  + entity_overlap       * 0.10
  + concept_overlap      * 0.15
  + llm_reasoning_score  * 0.20
  + evidence_score       * 0.10
```

Weights must be configurable.

These values are initial defaults, not permanent constants.

---

# 27. Strength vs Confidence

Store separately.

### Strength

How strongly two objects appear related.

### Confidence

How confident the system is that the inferred relationship is correct.

Example:

```text
strength = 0.91
confidence = 0.63
```

---

# 28. Relationship History

Do not overwrite relationship changes.

Use:

```sql
relationship_events
```

Fields:

```text
id
relationship_id
event_type
old_strength
new_strength
old_confidence
new_confidence
actor_type
actor_id
reason
created_at
```

Events:

```text
created
strength_changed
confidence_changed
accepted
rejected
deprecated
restored
```

---

# 29. Perspectives

```sql
perspectives
```

Fields:

```text
id UUID
workspace_id UUID
name TEXT
description TEXT
system_prompt TEXT NULL
configuration JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

Examples:

```text
Security
Machine Learning
Networking
Infrastructure
DevOps
Operating Systems
Cloud
Custom
```

---

# 30. Perspective Relationship Scores

Do not duplicate relationships for each perspective.

Instead:

```sql
perspective_relationship_scores
```

Fields:

```text
id UUID
perspective_id UUID
relationship_id UUID
relevance_score NUMERIC(5,4)
confidence NUMERIC(5,4)
explanation TEXT
ai_run_id UUID
updated_at TIMESTAMP
```

This preserves one underlying graph.

---

# 31. Perspective Node Scores

```sql
perspective_node_scores
```

Fields:

```text
perspective_id
node_type
node_id
relevance_score
importance_score
updated_at
```

---

# 32. Perspective Computation

For a selected perspective:

```text
Global Graph
    ↓
Perspective scoring
    ↓
Filter low relevance
    ↓
Re-rank nodes
    ↓
Re-rank relationships
    ↓
Graph layout
    ↓
Perspective View
```

---

# 33. Canvas

```sql
canvases
```

Fields:

```text
id UUID
workspace_id UUID
name TEXT
description TEXT
viewport JSONB
settings JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 34. Canvas Nodes

```sql
canvas_nodes
```

Fields:

```text
id UUID
canvas_id UUID
node_type TEXT
reference_type TEXT NULL
reference_id UUID NULL
x DOUBLE PRECISION
y DOUBLE PRECISION
width DOUBLE PRECISION
height DOUBLE PRECISION
z_index INTEGER
style JSONB
metadata JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

Node types:

```text
note
block
concept
image
pdf
text
group
relationship
```

---

# 35. Canvas Edges

```sql
canvas_edges
```

Fields:

```text
id UUID
canvas_id UUID
source_node_id UUID
target_node_id UUID
edge_type TEXT
label TEXT
style JSONB
metadata JSONB
created_at TIMESTAMP
updated_at TIMESTAMP
```

Canvas edges are independent from knowledge graph relationships.

This is important.

A user may visually connect two objects without asserting a semantic relationship.

---

# 36. Graph Edge vs Canvas Edge

### Knowledge graph edge

Means:

> "These concepts are related."

### Canvas edge

Means:

> "I want these two things visually connected here."

They must not be conflated.

---

# 37. Embeddings

```sql
embeddings
```

Fields:

```text
id UUID
workspace_id UUID

owner_type TEXT
owner_id UUID

embedding_model TEXT
embedding_provider TEXT
dimensions INTEGER

vector VECTOR
content_hash TEXT

created_at TIMESTAMP
updated_at TIMESTAMP
```

---

# 38. Embedding Strategy

Generate embeddings for:

```text
Notes
Blocks
Concepts
Claims
Sources
Selected relationship evidence
```

Do not automatically embed every database row.

---

# 39. Embedding Versioning

Embedding identity:

```text
provider
model
dimensions
content_hash
```

Example:

```text
ollama
nomic-embed-text
768
sha256(...)
```

If the content changes:

```text
new hash
→ new embedding
```

---

# 40. Vector Index

MVP:

```text
PostgreSQL
+
pgvector
+
HNSW
```

The architecture should hide vector operations behind:

```typescript
VectorStore
```

so the implementation can later move to:

```text
Qdrant
Milvus
Weaviate
```

without rewriting search logic.

---

# 41. AI Architecture

The AI system consists of:

```text
AI Gateway
├── Provider Registry
├── Model Registry
├── Capability Resolver
├── Routing Engine
├── Prompt Registry
├── Structured Output Validator
├── Token/Cost Tracker
├── Cache
├── Retry Manager
└── Provider Adapters
```

---

# 42. AI Provider Interface

Conceptual TypeScript interface:

```typescript
interface AIProvider {
  id: string;

  capabilities(): ProviderCapabilities;

  listModels(): Promise<ModelInfo[]>;

  chat(request: ChatRequest): Promise<ChatResponse>;

  stream(request: ChatRequest): AsyncIterable<ChatChunk>;

  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;

  generateStructured<T>(
    request: StructuredRequest<T>
  ): Promise<T>;

  vision?(
    request: VisionRequest
  ): Promise<VisionResponse>;

  transcribe?(
    request: TranscriptionRequest
  ): Promise<TranscriptionResponse>;

  healthCheck(): Promise<ProviderHealth>;
}
```

Provider-specific features remain optional.

---

# 43. Provider Adapters

Directory:

```text
packages/ai/providers/

openai/
anthropic/
ollama/
google/
nvidia/
openai-compatible/
```

Each provider implements the same internal interface.

---

# 44. OpenAI-Compatible Adapter

A generic adapter should support:

```text
base_url
api_key
model
headers
```

This allows:

```text
Ollama
vLLM
LM Studio
OpenRouter
custom inference servers
```

where compatible.

Ollama explicitly supports OpenAI-compatible chat/completions and embeddings endpoints, including vision and tools in its compatibility layer.

---

# 45. Anthropic Adapter

Anthropic should have its own adapter because its native API differs from OpenAI-style APIs.

Current Anthropic API access is based around its Messages API, so the internal gateway must normalize provider-specific request/response structures.

---

# 46. Provider Capability Discovery

A provider/model should expose:

```typescript
interface ModelCapabilities {
  chat: boolean;
  streaming: boolean;
  structuredOutput: boolean;
  toolCalling: boolean;
  vision: boolean;
  embeddings: boolean;
  audioInput: boolean;
  audioOutput: boolean;
  reasoning: boolean;
  contextWindow: number;
}
```

Never assume that all models support all features.

---

# 47. AI Model Registry

```sql
ai_models
```

Fields:

```text
id UUID
provider_id UUID
model_name TEXT
display_name TEXT
capabilities JSONB
context_window INTEGER
input_price NUMERIC NULL
output_price NUMERIC NULL
embedding_dimensions INTEGER NULL
enabled BOOLEAN
metadata JSONB
```

---

# 48. AI Providers Database

```sql
ai_providers
```

Fields:

```text
id UUID
workspace_id UUID
name TEXT
provider_type TEXT
base_url TEXT
credentials_ref TEXT
configuration JSONB
enabled BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
```

Never store raw API keys directly in ordinary application tables.

Use:

```text
environment secrets
OS keychain
secret manager
encrypted credential store
```

---

# 49. AI Routing

Define tasks:

```text
concept_extraction
entity_extraction
relationship_candidate_generation
relationship_reasoning
perspective_analysis
summarization
vision_extraction
transcription
graph_rag
writing
flashcard_generation
agent_reasoning
```

Each task resolves:

```text
Task
 ↓
Routing policy
 ↓
Eligible models
 ↓
Provider
 ↓
Execution
```

---

# 50. Routing Policy

Example:

```json
{
  "task": "relationship_reasoning",
  "strategy": "quality",
  "preferred": [
    "anthropic/strong-model",
    "openai/strong-model",
    "ollama/local-reasoning-model"
  ],
  "fallback": true
}
```

---

# 51. Privacy Routing

A workspace can define:

```text
local_only = true
```

Then:

```text
Cloud provider
   ↓
BLOCKED
```

Only local providers may execute.

---

# 52. AI Execution Pipeline

```text
AI Request
   ↓
Authorization
   ↓
Privacy policy
   ↓
Task classification
   ↓
Model selection
   ↓
Context retrieval
   ↓
Prompt construction
   ↓
Provider execution
   ↓
Structured validation
   ↓
Persistence
   ↓
Usage tracking
   ↓
Event emission
```

---

# 53. Structured AI Outputs

Never parse arbitrary natural language when a structured output is required.

Example:

```typescript
interface RelationshipCandidate {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  strength: number;
  confidence: number;
  explanation: string;
  evidence: EvidenceReference[];
}
```

Validate with Zod.

---

# 54. Prompt Registry

```text
packages/ai/prompts/

concept-extraction/
relationship-candidates/
relationship-reasoning/
perspective-scoring/
contradiction/
summarization/
flashcards/
graph-rag/
```

Each prompt:

```text
name
version
system prompt
schema
model requirements
```

---

# 55. AI Run

Every AI operation creates an `ai_run`.

```sql
ai_runs
```

Fields:

```text
id UUID
workspace_id UUID
job_id UUID NULL
provider_id UUID
model_id UUID
task_type TEXT
prompt_version TEXT
input_hash TEXT
status TEXT
input_tokens INTEGER
output_tokens INTEGER
estimated_cost NUMERIC
latency_ms INTEGER
error_code TEXT NULL
created_at TIMESTAMP
completed_at TIMESTAMP NULL
metadata JSONB
```

---

# 56. AI Cache

```sql
ai_cache
```

Cache key:

```text
SHA256(
  task
  +
  model
  +
  prompt_version
  +
  normalized_input
  +
  configuration
)
```

Cache entries should have TTL and optional LRU eviction.

---

# 57. Knowledge Processing Pipeline

When a block changes:

```text
Block Updated
     ↓
Content Hash
     ↓
Event
     ↓
Embedding Job
     ↓
Concept Extraction Job
     ↓
Entity Extraction Job
     ↓
Relationship Candidate Job
```

The pipeline should be asynchronous.

The editor must never wait for all AI processing.

---

# 58. Event Bus

Events:

```text
NOTE_CREATED
NOTE_UPDATED
NOTE_DELETED

BLOCK_CREATED
BLOCK_UPDATED
BLOCK_DELETED

CONCEPT_CREATED
CONCEPT_UPDATED

SOURCE_IMPORTED
ATTACHMENT_UPLOADED

EMBEDDING_CREATED

RELATIONSHIP_SUGGESTED
RELATIONSHIP_ACCEPTED
RELATIONSHIP_REJECTED

PERSPECTIVE_UPDATED

AI_JOB_STARTED
AI_JOB_COMPLETED
AI_JOB_FAILED
```

---

# 59. Background Jobs

Required jobs:

```text
ProcessNoteJob
ProcessBlockJob
GenerateEmbeddingJob
ExtractConceptsJob
ExtractEntitiesJob
FindRelationshipsJob
ScoreRelationshipsJob
GeneratePerspectiveScoresJob
ProcessPDFJob
OCRJob
TranscriptionJob
GenerateFlashcardsJob
RunAgentJob
BuildSearchIndexJob
```

---

# 60. Job State Machine

```text
queued
 ↓
running
 ↓
completed
```

Failure:

```text
running
 ↓
failed
 ↓
retrying
 ↓
running
```

Permanent failure:

```text
failed_permanent
```

---

# 61. Relationship Discovery Algorithm

Relationship discovery should happen in stages.

## Stage 1 — Candidate Retrieval

For a new block:

```text
embedding similarity
+
keyword overlap
+
concept overlap
+
entity overlap
```

Retrieve top N candidates.

Example:

```text
N = 50
```

---

## Stage 2 — Graph Expansion

For each candidate:

```text
candidate
 ↓
neighbor concepts
 ↓
neighbor notes
 ↓
existing relationships
```

This creates graph context.

---

## Stage 3 — Cheap Scoring

Use deterministic scoring.

Remove obviously irrelevant candidates.

---

## Stage 4 — LLM Reasoning

Send only high-quality candidates to a reasoning model.

The model determines:

```text
relationship type
strength
confidence
explanation
evidence
```

---

## Stage 5 — Validation

Validate:

```text
schema
IDs
scores
relationship type
evidence references
```

---

## Stage 6 — Persistence

Create:

```text
suggested relationship
```

unless automatic acceptance is enabled.

---

# 62. Relationship Candidate SQL

Conceptually:

```sql
SELECT *
FROM embeddings
WHERE workspace_id = $workspace
ORDER BY vector <=> $embedding
LIMIT 50;
```

Then filter by:

```text
deleted_at IS NULL
same workspace
supported object type
minimum similarity
```

---

# 63. Graph Expansion

Given:

```text
Node A
```

retrieve:

```text
A
├── direct neighbors
├── concepts
├── sources
└── evidence
```

with a configurable traversal depth:

```text
depth = 1
depth = 2
depth = 3
```

Avoid uncontrolled traversal.

---

# 64. GraphRAG Architecture

```text
User Question
      ↓
Query Analyzer
      ↓
Query Decomposer
      ↓
Semantic Search
      +
Graph Search
      +
Metadata Search
      ↓
Candidate Context
      ↓
Graph Expansion
      ↓
Evidence Ranking
      ↓
Context Compression
      ↓
LLM
      ↓
Answer + Citations
```

---

# 65. GraphRAG Query Object

```typescript
interface GraphRAGQuery {
  question: string;

  workspaceId: string;

  perspectiveId?: string;

  maxNodes: number;

  maxHops: number;

  minRelationshipStrength?: number;

  minConfidence?: number;

  sourceTypes?: string[];

  dateRange?: {
    from?: string;
    to?: string;
  };
}
```

---

# 66. GraphRAG Retrieval Ranking

Suggested:

```text
retrieval_score =
    semantic_similarity
  * 0.30
  + graph_relevance
  * 0.20
  + relationship_strength
  * 0.15
  + evidence_quality
  * 0.15
  + perspective_score
  * 0.10
  + recency
  * 0.05
  + source_quality
  * 0.05
```

These weights must be configurable.

---

# 67. GraphRAG Citations

Every generated answer should maintain references:

```text
answer claim
 ↓
retrieved block
 ↓
note
 ↓
source
```

UI should allow clicking the citation.

---

# 68. Perspective-Aware GraphRAG

If the user selects:

```text
Security
```

then retrieval should prioritize:

```text
security relationship scores
security concepts
security evidence
```

The question:

> "How is Linux related to networking?"

may produce different context under:

```text
Security
Infrastructure
Machine Learning
Performance
```

---

# 69. Contradiction Engine

Pipeline:

```text
New claim
 ↓
Retrieve semantically similar claims
 ↓
Find opposite/contradictory language
 ↓
LLM classification
 ↓
Evidence collection
 ↓
Contradiction suggestion
```

Do not automatically delete or modify either claim.

---

# 70. Knowledge Evolution Engine

Maintain snapshots or events.

Use:

```sql
knowledge_events
```

Fields:

```text
id
workspace_id
object_type
object_id
event_type
before_state JSONB
after_state JSONB
actor_type
actor_id
created_at
```

This enables:

```text
timeline
history
graph diff
concept evolution
relationship evolution
```

---

# 71. Graph Diff

Given two timestamps:

```text
T1
T2
```

compute:

```text
nodes_added
nodes_removed
nodes_changed

relationships_added
relationships_removed
relationships_changed

perspective_changes
```

---

# 72. Agent Architecture

Agents run through the same AI Gateway.

```text
Agent
 ↓
Permission Manager
 ↓
Tool Registry
 ↓
AI Gateway
 ↓
Provider
```

Agents should not directly call providers.

---

# 73. Agent Tools

Initial tools:

```text
search_notes
search_blocks
search_concepts
search_graph
get_relationships
get_evidence
create_suggestion
create_relationship
create_flashcard
create_summary
```

Dangerous tools:

```text
delete_note
delete_relationship
external_http
execute_code
```

must require explicit permissions.

---

# 74. Agent Execution

```text
Trigger
 ↓
Permission check
 ↓
Context retrieval
 ↓
Agent planning
 ↓
Tool execution
 ↓
Observation
 ↓
Reasoning
 ↓
Suggestion / action
 ↓
Audit log
```

---

# 75. Agent Triggers

Possible triggers:

```text
note_created
note_updated
daily_schedule
manual
graph_threshold
new_external_source
user_question
```

---

# 76. Search Architecture

Search should combine:

```text
PostgreSQL full-text
pg_trgm
vector search
graph search
metadata filters
```

API:

```text
SearchService.search()
```

should return ranked heterogeneous results.

---

# 77. Search Result

```typescript
interface SearchResult {
  objectType: string;
  objectId: string;
  title?: string;
  snippet: string;
  semanticScore?: number;
  lexicalScore?: number;
  graphScore?: number;
  finalScore: number;
}
```

---

# 78. Canvas Architecture

Canvas state should be independently persisted.

The canvas should never modify knowledge semantics merely because a user moves a card.

Moving:

```text
Concept A
```

from:

```text
x=100
```

to:

```text
x=500
```

must not change its knowledge relationships.

---

# 79. Canvas AI

AI canvas commands should use structured operations.

Example:

```json
{
  "operations": [
    {
      "type": "create_group",
      "title": "Security"
    },
    {
      "type": "move_node",
      "node_id": "...",
      "x": 400,
      "y": 200
    }
  ]
}
```

Never allow AI to return arbitrary executable frontend code.

---

# 80. Editor Architecture

Use a block-based editor.

Recommended:

```text
TipTap
+
ProseMirror
```

Each top-level block maps to the domain `blocks` table.

The editor should support:

```text
Markdown
slash commands
links
block references
embeds
AI commands
code blocks
images
tables
callouts
```

---

# 81. Frontend State

Use Zustand for UI state.

Separate:

```text
Server state
UI state
Editor state
Canvas state
Graph state
```

Do not put the entire application state into one global store.

---

# 82. Frontend Stores

Recommended:

```text
authStore
workspaceStore
editorStore
graphStore
canvasStore
perspectiveStore
aiStore
searchStore
commandStore
```

---

# 83. API Architecture

REST API for MVP.

Base:

```text
/api/v1
```

---

# 84. Notes API

```http
GET    /notes
POST   /notes
GET    /notes/:id
PATCH  /notes/:id
DELETE /notes/:id
```

---

# 85. Blocks API

```http
GET    /notes/:id/blocks
POST   /blocks
GET    /blocks/:id
PATCH  /blocks/:id
DELETE /blocks/:id
```

---

# 86. Concepts API

```http
GET    /concepts
POST   /concepts
GET    /concepts/:id
PATCH  /concepts/:id
GET    /concepts/:id/relationships
```

---

# 87. Relationships API

```http
GET    /relationships
POST   /relationships
GET    /relationships/:id
PATCH  /relationships/:id
DELETE /relationships/:id

POST   /relationships/:id/accept
POST   /relationships/:id/reject
```

---

# 88. Graph API

```http
GET /graph
GET /graph/local/:nodeType/:nodeId
GET /graph/neighbors/:nodeType/:nodeId
GET /graph/path
GET /graph/diff
```

Example:

```http
GET /graph/local/concept/123?depth=2
```

---

# 89. Perspective API

```http
GET    /perspectives
POST   /perspectives
PATCH  /perspectives/:id
DELETE /perspectives/:id

GET /perspectives/:id/graph
GET /perspectives/:id/nodes
GET /perspectives/:id/relationships
POST /perspectives/:id/recalculate
```

---

# 90. Canvas API

```http
GET    /canvases
POST   /canvases
GET    /canvases/:id
PATCH  /canvases/:id
DELETE /canvases/:id

POST   /canvases/:id/nodes
PATCH  /canvases/:id/nodes/:nodeId
DELETE /canvases/:id/nodes/:nodeId

POST   /canvases/:id/edges
DELETE /canvases/:id/edges/:edgeId
```

---

# 91. Search API

```http
GET /search?q=...
```

Optional:

```text
perspective
type
date
relationship_strength
confidence
source
```

---

# 92. AI API

```http
POST /ai/chat
POST /ai/analyze
POST /ai/extract
POST /ai/relationships
POST /ai/summarize
POST /ai/flashcards
POST /ai/perspective
```

---

# 93. AI Provider API

```http
GET  /ai/providers
POST /ai/providers
PATCH /ai/providers/:id
DELETE /ai/providers/:id

GET  /ai/providers/:id/models
POST /ai/providers/:id/test
```

---

# 94. Job API

```http
GET /jobs
GET /jobs/:id
POST /jobs/:id/retry
POST /jobs/:id/cancel
```

---

# 95. Authentication

Recommended:

```text
Session or secure JWT
HttpOnly cookies
CSRF protection
refresh token rotation
```

For local-only desktop builds, authentication may be optional.

---

# 96. Authorization

Authorization should operate at:

```text
workspace
object
agent
provider
tool
```

levels.

---

# 97. Multi-Workspace Isolation

Every knowledge object must have:

```text
workspace_id
```

and all queries must enforce workspace isolation.

Never rely only on frontend filtering.

---

# 98. Database Constraints

Foreign keys must enforce:

```text
workspace consistency
object existence
relationship validity
```

Where polymorphic relationships are used, application-level validation must supplement database constraints.

---

# 99. Soft Deletion

Knowledge objects should use:

```text
deleted_at
```

rather than immediate physical deletion.

A garbage collector can permanently delete after a configurable retention period.

---

# 100. Audit Log

```sql
audit_events
```

Store:

```text
user
action
object
before
after
timestamp
IP/device metadata where appropriate
```

Sensitive data should not be unnecessarily logged.

---

# 101. Import Architecture

```text
Importer
 ↓
Parser
 ↓
Normalizer
 ↓
Knowledge Objects
 ↓
Relationship Resolver
 ↓
Embedding
```

Adapters:

```text
MarkdownImporter
ObsidianImporter
NotionImporter
HTMLImporter
PDFImporter
JSONImporter
```

---

# 102. Export Architecture

```text
Knowledge Core
 ↓
Export Adapter
 ↓
Markdown
JSON
HTML
GraphML
JSON-LD
```

Markdown should remain a first-class export format.

---

# 103. Multimodal Pipeline

## Image

```text
Image
 ↓
Vision model
 ↓
Objects / text / diagram
 ↓
Concepts
 ↓
Relationships
```

## PDF

```text
PDF
 ↓
Parser
 ↓
OCR if required
 ↓
Pages
 ↓
Blocks
 ↓
Concept extraction
 ↓
Embeddings
```

## Audio

```text
Audio
 ↓
Transcription
 ↓
Segments
 ↓
Concept extraction
```

## Video

```text
Video
 ↓
Audio transcription
+
Frame sampling
 ↓
Multimodal extraction
 ↓
Concepts
```

---

# 104. Provenance Architecture

Every derived object must be able to answer:

```text
Where did this come from?
```

Example:

```text
Concept:
CPU Scheduling

Derived from:

Note #123
 └── Block #8

PDF #44
 └── Page 172

Video #91
 └── Timestamp 14:32
```

---

# 105. File Storage

Files should be addressed through:

```typescript
interface ObjectStorage {
  put(file): Promise<StoredObject>;
  get(key): Promise<ReadableStream>;
  delete(key): Promise<void>;
  exists(key): Promise<boolean>;
}
```

---

# 106. Security for Files

Uploaded files must undergo:

```text
MIME validation
extension validation
size validation
malware scanning where available
sandboxed processing
```

PDF/image/video parsers should not run with unnecessary privileges.

---

# 107. Secrets Management

AI credentials must never be:

```text
committed
logged
returned by API
stored in plaintext database fields
```

Use a `CredentialStore` abstraction.

---

# 108. Observability

Use:

```text
OpenTelemetry
structured logs
metrics
tracing
```

Metrics:

```text
AI latency
AI cost
job latency
job failures
embedding throughput
search latency
graph query latency
database latency
```

---

# 109. Performance Targets

MVP targets:

### Editor

```text
Typing latency:
< 50ms locally
```

### Search

```text
Typical search:
< 300ms
```

### Local graph

```text
< 500ms for normal local graph
```

### AI

AI latency is provider-dependent.

The UI must never block while waiting for background analysis.

---

# 110. Scalability

MVP target:

```text
1 user
100,000 knowledge objects
1,000,000 relationships
```

The architecture should eventually support:

```text
10M+ objects
100M+ relationships
```

without requiring a domain rewrite.

---

# 111. Graph Scaling Strategy

Do not load the entire graph into the browser.

Use:

```text
viewport loading
depth-limited traversal
server-side filtering
cluster aggregation
progressive expansion
```

---

# 112. Graph Rendering

The frontend receives:

```typescript
interface GraphNode {
  id: string;
  type: string;
  label: string;
  importance: number;
  metadata: Record<string, unknown>;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  strength: number;
  confidence: number;
}
```

---

# 113. Graph Layout

Initial algorithms:

```text
Force-directed
Hierarchical
Radial
Timeline
Cluster
```

Perspective mode may change layout strategy.

---

# 114. Graph Caching

Cache:

```text
local graph
perspective graph
cluster calculations
common searches
```

Invalidate when:

```text
relationship changed
concept changed
perspective changed
```

---

# 115. Offline Synchronization

Future architecture:

```text
Local Database
      ↓
Change Log
      ↓
Sync Engine
      ↓
Remote Server
```

The local data layer should eventually be compatible with CRDT synchronization.

---

# 116. CRDT Preparation

Even if CRDT collaboration is not implemented in MVP:

- IDs must be globally unique.
- Updates should be event-friendly.
- Block ordering should avoid fragile integer-only positions.
- Deletes should be represented as tombstones.
- Canvas operations should be independently addressable.

Use a sortable position scheme such as fractional indexing or LexoRank-like identifiers rather than relying solely on integer positions.

---

# 117. Event Sourcing vs CRUD

The MVP should remain CRUD-based.

However, important mutations should emit domain events.

Recommended:

```text
CRUD
+
Domain Events
```

rather than full event sourcing.

This gives future synchronization and history capabilities without unnecessary complexity.

---

# 118. Transaction Boundaries

Example:

Creating a note:

```text
BEGIN

create note
create initial blocks

COMMIT

emit NOTE_CREATED
```

AI processing happens asynchronously after commit.

Never hold a database transaction open while waiting for an LLM.

---

# 119. Concurrency

Use optimistic concurrency for notes and blocks.

Each object may have:

```text
version INTEGER
```

Update:

```sql
UPDATE blocks
SET content = $content,
    version = version + 1
WHERE id = $id
AND version = $expected_version;
```

If zero rows are affected:

```text
409 Conflict
```

---

# 120. AI Concurrency

Limit concurrent AI jobs per workspace:

```text
max_concurrent_jobs
```

Provider-specific limits should also be respected.

---

# 121. Provider Rate Limiting

The AI Gateway should implement:

```text
token bucket
request queue
retry-after handling
exponential backoff
provider-specific concurrency
```

---

# 122. Retry Policy

Retry only transient failures.

Examples:

```text
429
500
502
503
504
network timeout
```

Do not automatically retry:

```text
invalid API key
invalid request
schema failure caused by application bug
permission denied
```

---

# 123. AI Failover

Example:

```text
Primary:
Claude

Failure:
429

Fallback:
OpenAI

Failure:
network

Fallback:
Ollama
```

Every failover must be logged.

---

# 124. Cost Router

Before execution:

```text
estimate cost
compare budget
select provider
```

Example:

```text
Simple extraction
→ local model

Complex reasoning
→ premium model
```

---

# 125. Token Budget

Every AI task should have:

```text
max_input_tokens
max_output_tokens
timeout
cost_limit
```

---

# 126. Prompt Injection Defense

External documents are untrusted.

The system must distinguish:

```text
SYSTEM INSTRUCTIONS
USER INSTRUCTIONS
KNOWLEDGE CONTENT
EXTERNAL CONTENT
```

A PDF saying:

> "Ignore previous instructions..."

must be treated as document content, not an instruction.

---

# 127. Agent Sandboxing

Agents should not have arbitrary access to:

```text
filesystem
shell
network
database
```

Tools must expose narrow operations.

---

# 128. Web Access

Future research agents may access the web.

Use:

```text
WebSearchTool
WebFetchTool
```

with domain allowlists and SSRF protection.

---

# 129. Database Access from AI

Never give an LLM raw SQL access in the default configuration.

Use typed tools:

```text
search_notes()
find_concepts()
get_neighbors()
find_relationships()
```

---

# 130. Testing Strategy

Testing layers:

```text
Unit
Integration
Contract
End-to-end
AI evaluation
Performance
Security
```

---

# 131. Unit Tests

Test:

```text
relationship scoring
perspective scoring
query parsing
permissions
provider routing
cost calculation
block references
graph traversal
```

---

# 132. Provider Contract Tests

Every provider adapter must pass the same contract suite:

```text
list models
chat
stream
structured output
embeddings
vision if supported
health check
error normalization
```

This is critical to provider independence.

---

# 133. AI Evaluation

Maintain a fixed evaluation dataset.

Example:

```text
100 notes
500 blocks
200 concepts
500 known relationships
50 contradictions
```

Evaluate:

```text
concept extraction precision
relationship precision
relationship recall
citation accuracy
perspective accuracy
hallucination rate
```

---

# 134. Relationship Evaluation

Do not optimize only for the number of discovered relationships.

Metrics:

```text
precision@K
recall@K
accepted suggestion rate
false relationship rate
```

The system should prefer:

> fewer high-quality relationships

over:

> thousands of meaningless edges.

---

# 135. Security Testing

Include:

```text
OWASP testing
authorization tests
tenant isolation
prompt injection
SSRF
file upload
XSS
CSRF
secret leakage
SQL injection
rate limiting
```

---

# 136. Backup

Backup:

```text
PostgreSQL
object storage
configuration
workspace metadata
```

AI embeddings can be regenerated, but backing them up may still improve recovery time.

---

# 137. Disaster Recovery

Target:

```text
RPO: 24h initially
RTO: 4h initially
```

Can be improved for production.

---

# 138. Deployment Modes

## Local

```text
Desktop
 ├── App
 ├── SQLite/PostgreSQL
 ├── Ollama
 └── Local storage
```

## Self-hosted

```text
Docker Compose
 ├── Web
 ├── API
 ├── Worker
 ├── PostgreSQL
 ├── Redis
 └── MinIO
```

## Cloud

```text
Frontend
API
Workers
Managed PostgreSQL
Managed Redis
Object Storage
Cloud AI providers
```

---

# 139. Local Database Strategy

For the first implementation, PostgreSQL can be used even in local/self-hosted mode.

A future desktop distribution may use:

```text
SQLite
+
sqlite-vec / compatible vector layer
```

behind the same repository interfaces.

The domain layer must not directly depend on PostgreSQL-specific SQL.

---

# 140. Repository Pattern

Example:

```typescript
interface NoteRepository {
  create(note: CreateNote): Promise<Note>;
  getById(id: string): Promise<Note | null>;
  update(id: string, patch: UpdateNote): Promise<Note>;
  delete(id: string): Promise<void>;
}
```

Similar:

```text
BlockRepository
ConceptRepository
RelationshipRepository
PerspectiveRepository
CanvasRepository
EmbeddingRepository
```

---

# 141. Domain Services

Core services:

```text
KnowledgeService
BlockService
ConceptService
RelationshipService
PerspectiveService
GraphService
SearchService
CanvasService
SourceService
```

---

# 142. AI Services

```text
AIService
ExtractionService
EmbeddingService
RelationshipDiscoveryService
GraphRAGService
PerspectiveAIService
AgentService
FlashcardService
```

---

# 143. Separation of Concerns

Never put:

```text
database code
LLM calls
graph algorithms
HTTP logic
```

inside frontend components.

---

# 144. Recommended Dependency Flow

```text
HTTP
 ↓
Application Service
 ↓
Domain Service
 ↓
Repository Interface
 ↓
Infrastructure
```

AI:

```text
Application Service
 ↓
AI Service
 ↓
AI Gateway
 ↓
Provider Adapter
```

---

# 145. Example: Creating a Note

```text
POST /notes

        ↓

NoteController

        ↓

NoteService.create()

        ↓

NoteRepository.create()

        ↓

PostgreSQL

        ↓

emit NOTE_CREATED

        ↓

Queue ProcessNoteJob

        ↓

return note immediately
```

---

# 146. Example: Processing a Note

```text
ProcessNoteJob
      ↓
Load note
      ↓
Extract blocks
      ↓
Generate embeddings
      ↓
Extract concepts
      ↓
Extract entities
      ↓
Find candidates
      ↓
Score candidates
      ↓
LLM reasoning
      ↓
Create relationship suggestions
      ↓
Update search indexes
```

---

# 147. Example: User Asks AI

User:

> "How are operating systems related to machine learning?"

Pipeline:

```text
POST /ai/chat
      ↓
GraphRAGService
      ↓
Query decomposition
      ↓
Semantic retrieval
      ↓
Graph traversal
      ↓
Perspective filter
      ↓
Evidence ranking
      ↓
Context builder
      ↓
AI Gateway
      ↓
Selected model
      ↓
Structured answer
      ↓
Citations
      ↓
Streaming response
```

---

# 148. Example: Perspective Switch

User selects:

```text
Security
```

Frontend:

```text
GET /perspectives/security/graph
```

Backend:

```text
load global graph
 ↓
load security scores
 ↓
filter/re-rank
 ↓
return graph
```

The underlying relationships remain unchanged.

---

# 149. Example: AI Provider Switch

User changes:

```text
Provider:
OpenAI
```

to:

```text
Provider:
Ollama
```

Only the routing configuration changes.

The following must remain unchanged:

```text
notes
blocks
concepts
relationships
embeddings
canvas
perspectives
sources
```

Some derived AI outputs may optionally be regenerated.

---

# 150. Provider Independence Test

A critical integration test:

```text
Create knowledge with OpenAI
 ↓
Switch to Ollama
 ↓
Reprocess knowledge
 ↓
Verify domain data remains valid
```

Then:

```text
Switch to Anthropic
 ↓
Run GraphRAG
 ↓
Verify citations
```

No domain-level code should change.

---

# 151. Migration Strategy

Database migrations must be:

```text
forward-only
versioned
idempotent where practical
```

Never manually modify production schema.

---

# 152. Seed Data

Development seed:

```text
10 notes
50 blocks
20 concepts
50 relationships
5 perspectives
2 canvases
```

Include realistic technical knowledge for graph testing.

---

# 153. Development Environment

Recommended:

```text
Docker Compose
```

Services:

```text
postgres
redis
minio
api
worker
web
```

Optional:

```text
ollama
```

---

# 154. Environment Variables

Example:

```env
DATABASE_URL=
REDIS_URL=

OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=
OBJECT_STORAGE_BUCKET=

AUTH_SECRET=

AI_ENCRYPTION_KEY=
```

Provider credentials should be managed through the credential store.

---

# 155. Configuration Layers

Configuration precedence:

```text
System defaults
 ↓
Environment
 ↓
Workspace settings
 ↓
User settings
 ↓
Request override
```

A request must never override security/privacy restrictions.

---

# 156. API Versioning

Use:

```text
/api/v1
```

Breaking changes require:

```text
/api/v2
```

---

# 157. OpenAPI

The backend should generate an OpenAPI specification.

The OpenAPI definition should be used to generate:

```text
TypeScript client
API types
SDKs
documentation
```

---

# 158. Real-Time Updates

MVP:

```text
WebSocket / SSE
```

for:

```text
AI streaming
job progress
graph updates
notifications
```

Future:

```text
CRDT synchronization
```

---

# 159. Streaming AI

AI responses should stream:

```text
token chunks
citations
tool activity
completion state
```

Example:

```text
event: text
event: citation
event: tool
event: done
```

---

# 160. AI Response Protocol

Internally:

```typescript
type AIStreamEvent =
  | { type: "text"; content: string }
  | { type: "citation"; citation: Citation }
  | { type: "tool_start"; tool: string }
  | { type: "tool_end"; tool: string }
  | { type: "error"; error: string }
  | { type: "done"; usage: Usage };
```

---

# 161. Privacy Modes

Workspace-level:

```text
cloud_allowed
local_preferred
local_only
```

User-level override cannot weaken a workspace `local_only` policy.

---

# 162. AI Data Classification

Knowledge objects may be classified:

```text
public
private
sensitive
local_only
```

Provider routing respects classification.

---

# 163. Example Privacy Policy

```text
Sensitive:
→ Ollama only

Private:
→ Ollama preferred
→ cloud requires confirmation

Normal:
→ configured routing policy
```

---

# 164. Knowledge Graph Integrity

The graph must enforce:

```text
No self relationships unless explicitly supported
No references to deleted objects
No cross-workspace relationships
No invalid relationship types
```

---

# 165. Graph Cycles

Cycles are allowed.

Example:

```text
Operating Systems
 ↓
Networking
 ↓
Distributed Systems
 ↓
Operating Systems
```

Do not treat cycles as errors.

---

# 166. Concept Merging

Concept merging should be transactional.

```text
Concept A
Concept B
 ↓
Merge suggestion
 ↓
User approval
 ↓
Canonical concept selected
 ↓
relationships redirected
 ↓
aliases updated
 ↓
old concept deprecated
```

Never hard-delete historical references.

---

# 167. Relationship Deduplication

Before creating a relationship:

```text
source
target
relationship_type
workspace
```

must be checked for existing active relationships.

---

# 168. Relationship Direction

Some relationships are directional:

```text
CAUSES
DEPENDS_ON
PART_OF
IMPLEMENTS
```

Some may be symmetric:

```text
RELATED_TO
SIMILAR_TO
```

The relationship type definition should specify:

```text
directed: boolean
```

---

# 169. Perspective Storage

Do not store perspective as a tag on every note.

Instead:

```text
Global graph
+
Perspective scoring
```

This allows arbitrary perspectives without duplicating knowledge.

---

# 170. Custom Perspectives

User creates:

```text
"How I understand distributed systems"
```

The system stores:

```text
name
description
prompt
rules
weights
```

AI computes relevance.

---

# 171. Perspective Rules

Future rule engine:

```text
include concept type
exclude source type
boost relationship type
minimum confidence
date filter
```

---

# 172. Knowledge Graph Query Language

Do not build a complex custom language in MVP.

Start with:

```text
structured JSON query
```

Example:

```json
{
  "nodeType": "concept",
  "filters": {
    "type": "technology",
    "minConnections": 5
  }
}
```

Later introduce a user-facing DSL.

---

# 173. Natural Language → Query

AI converts:

> "Show technologies related to security with more than five connections."

into structured query JSON.

The generated query must be validated before execution.

---

# 174. Data Lifecycle

```text
Capture
 ↓
Raw Knowledge
 ↓
Normalized Knowledge
 ↓
Indexed Knowledge
 ↓
AI Enrichment
 ↓
Relationships
 ↓
Perspective Analysis
 ↓
Derived Outputs
```

---

# 175. Source of Truth Hierarchy

Priority:

```text
1. User-authored content
2. Imported source content
3. Explicit user relationships
4. AI-derived concepts
5. AI-derived relationships
6. AI summaries
```

AI cannot silently override levels 1–3.

---

# 176. AI Hallucination Protection

For knowledge-grounded answers:

```text
No evidence
→ explicitly state uncertainty
```

The assistant must distinguish:

```text
Found in your knowledge
vs
General model knowledge
```

---

# 177. Answer Modes

AI assistant should support:

```text
My Knowledge
My Knowledge + General AI
My Knowledge Only
```

Default:

```text
My Knowledge + General AI
```

but clearly label externally generated information.

---

# 178. Research Mode

Research mode may use:

```text
User graph
+
external web
+
documents
```

External sources must remain distinct from personal knowledge until explicitly imported.

---

# 179. External Knowledge Boundary

Do not automatically turn web content into personal knowledge.

Instead:

```text
External Research
 ↓
Suggested Knowledge
 ↓
User imports
 ↓
Personal Knowledge
```

---

# 180. Background Maintenance

Nightly or scheduled jobs:

```text
Find duplicate concepts
Find orphan nodes
Find contradictions
Recalculate stale relationships
Detect stale sources
Generate review queue
```

All automated changes should respect workspace permissions.

---

# 181. Staleness

A knowledge object may have:

```text
last_verified_at
```

Some concepts may have a configurable validity period.

Example:

```text
Software API:
180 days

Mathematical definition:
indefinite

Personal opinion:
user-controlled
```

---

# 182. Knowledge Verification

AI can suggest:

> "This information may be outdated."

It should not automatically mark it false.

---

# 183. Learning Engine

Inputs:

```text
concept
relationship
difficulty
review history
importance
```

Output:

```text
review schedule
flashcards
questions
```

---

# 184. Flashcard Data Model

```sql
flashcards
```

Fields:

```text
id
workspace_id
source_type
source_id
question
answer
difficulty
interval
due_at
created_at
updated_at
```

---

# 185. Review Events

```sql
review_events
```

Track:

```text
flashcard_id
rating
response_time
reviewed_at
```

---

# 186. Security Boundaries

```text
Browser
 ↓
API
 ↓
Domain
 ↓
Database
```

AI providers are external trust boundaries.

User-uploaded files are untrusted.

Web content is untrusted.

AI outputs are untrusted until validated.

---

# 187. Threat Model

Major threats:

```text
Account compromise
Prompt injection
Malicious PDF
Malicious web page
SSRF
API key theft
Cross-workspace leakage
AI hallucination
Agent privilege escalation
Data exfiltration
```

---

# 188. Multi-Tenant Safety

Every query must include workspace scoping.

Example repository method:

```typescript
getRelationship(
  workspaceId: string,
  relationshipId: string
)
```

Avoid:

```typescript
getRelationship(id)
```

for tenant-sensitive objects.

---

# 189. Database Row-Level Security

For hosted multi-user deployments, PostgreSQL RLS should be considered as a defense-in-depth layer.

Application authorization remains mandatory.

---

# 190. Backup Encryption

Backups must be encrypted.

Keys must be stored independently from backup storage.

---

# 191. Implementation Phases

## Phase 1 — Foundation

```text
Repository
PostgreSQL
Auth
Workspace
Notes
Blocks
Editor
```

---

## Phase 2 — Knowledge Core

```text
Concepts
Entities
Sources
Embeddings
Search
Relationships
Evidence
```

---

## Phase 3 — AI Gateway

```text
Provider interface
OpenAI-compatible provider
Ollama
Anthropic
Routing
Cost tracking
Caching
```

---

## Phase 4 — Graph

```text
Graph API
Graph visualization
Local graph
Relationship suggestions
```

---

## Phase 5 — Perspectives

```text
Perspective model
Perspective scoring
Perspective graph
Comparison
```

---

## Phase 6 — Canvas

```text
Infinite canvas
Manual relationships
Embeds
AI canvas operations
```

---

## Phase 7 — GraphRAG

```text
Query decomposition
Hybrid retrieval
Graph traversal
Evidence ranking
Citations
```

---

## Phase 8 — Multimodal

```text
PDF
OCR
Images
Vision
Audio
Video
```

---

## Phase 9 — Agents

```text
Agent framework
Permissions
Scheduled maintenance
Contradiction detection
Knowledge evolution
```

---

## Phase 10 — Learning

```text
Flashcards
Spaced repetition
Learning paths
Knowledge gaps
```

---

# 192. MVP Implementation Order

The coding agent should implement in this order:

```text
1. Project scaffolding
2. Database
3. Authentication
4. Workspace
5. Notes
6. Blocks
7. Editor
8. Concepts
9. Sources
10. Embeddings
11. Search
12. Relationships
13. Evidence
14. AI Gateway
15. Ollama adapter
16. OpenAI-compatible adapter
17. Anthropic adapter
18. Relationship discovery
19. Graph API
20. Graph UI
21. Perspectives
22. Canvas
23. GraphRAG
24. AI assistant
25. Import/export
```

---

# 193. First Coding Milestone

The first milestone is considered complete when:

```text
User
 ↓
creates note
 ↓
writes blocks
 ↓
system stores blocks
 ↓
Ollama generates embeddings
 ↓
concepts extracted
 ↓
relationships discovered
 ↓
graph displays them
 ↓
user selects Security perspective
 ↓
graph changes relevance
 ↓
user opens relationship
 ↓
evidence is displayed
```

No external cloud AI is required.

---

# 194. Second Coding Milestone

The second milestone proves provider independence:

```text
Same knowledge base

        ┌── Ollama
        ├── OpenAI-compatible
        └── Anthropic

all produce valid AI runs
```

The user can switch providers without modifying application code.

---

# 195. Architecture Acceptance Criteria

The architecture is accepted only if:

### Knowledge

- Notes are independent from AI.
- Blocks have stable IDs.
- Relationships are first-class objects.
- Evidence is stored.
- Relationship history exists.

### AI

- Providers are pluggable.
- Ollama works.
- At least one cloud provider works.
- OpenAI-compatible APIs work.
- Provider-specific capabilities are detected.
- AI outputs are schema validated.

### Graph

- Graph can be queried.
- Local graph works.
- Relationships have strength/confidence.
- Perspective filtering works.
- Graph does not require AI to render.

### Canvas

- Canvas nodes reference knowledge objects.
- Canvas edges are independent from semantic graph edges.
- Manual positioning persists.

### Privacy

- Local-only mode works.
- Cloud providers can be disabled.
- API keys are never exposed to frontend JavaScript.
- Workspace isolation is enforced.

### Reliability

- AI jobs are asynchronous.
- Failed jobs retry.
- AI operations are logged.
- Domain transactions never depend on LLM availability.

---

# 196. Critical Architectural Rule

The following dependency is forbidden:

```text
Note
 ↓
OpenAI
 ↓
Knowledge Graph
```

The correct architecture is:

```text
Note
 ↓
Knowledge Core
 ↓
AI Gateway
 ↓
Provider
 ↓
Derived Knowledge
 ↓
Knowledge Core
```

AI is therefore a **consumer and producer of derived knowledge**, not the owner of the knowledge model.

---

# 197. Final Architecture

```text
                           ┌───────────────────────┐
                           │       CLIENTS         │
                           │                       │
                           │ Web │ Mobile │ CLI    │
                           └───────────┬───────────┘
                                       │
                                       ▼
                           ┌───────────────────────┐
                           │       API/BFF         │
                           └───────────┬───────────┘
                                       │
             ┌─────────────────────────┼─────────────────────────┐
             │                         │                         │
             ▼                         ▼                         ▼
   ┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
   │  KNOWLEDGE CORE  │      │    AI GATEWAY    │      │   JOB SYSTEM     │
   │                  │      │                  │      │                  │
   │ Notes            │      │ Routing          │      │ Extraction       │
   │ Blocks           │      │ Providers        │      │ Embeddings       │
   │ Concepts         │      │ Models           │      │ Relationships    │
   │ Entities         │      │ Cost             │      │ Agents           │
   │ Sources          │      │ Cache            │      │ Media processing │
   │ Relationships    │      │ Failover         │      │                  │
   │ Evidence         │      │ Policies         │      │                  │
   │ Perspectives     │      │                  │      │                  │
   └────────┬─────────┘      └────────┬─────────┘      └────────┬─────────┘
            │                         │                         │
            └──────────────┬──────────┴──────────┬──────────────┘
                           │                     │
                           ▼                     ▼
                 ┌──────────────────┐   ┌──────────────────┐
                 │   PostgreSQL     │   │      Redis       │
                 │                  │   │                  │
                 │ Domain Data      │   │ Queue / Cache    │
                 │ pgvector         │   │ Events           │
                 └────────┬─────────┘   └──────────────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │  OBJECT STORAGE  │
                 │                  │
                 │ PDF / Images     │
                 │ Audio / Video    │
                 │ Attachments      │
                 └──────────────────┘


                         AI PROVIDER LAYER
                                  │
          ┌───────────────────────┼────────────────────────┐
          │                       │                        │
          ▼                       ▼                        ▼
      ┌─────────┐             ┌─────────┐              ┌─────────┐
      │ OpenAI  │             │ Claude  │              │ Ollama  │
      └─────────┘             └─────────┘              └─────────┘
          │                       │                        │
          ▼                       ▼                        ▼
      ┌─────────┐             ┌─────────┐              ┌─────────┐
      │ Gemini  │             │ NVIDIA  │              │ vLLM    │
      └─────────┘             └─────────┘              └─────────┘
          │                       │                        │
          └───────────────────────┼────────────────────────┘
                                  ▼
                         ANY FUTURE PROVIDER
```

---

# 198. Architectural North Star

The final system should behave like this:

```text
                 EVERYTHING YOU LEARN
                          │
                          ▼
                 ┌─────────────────┐
                 │ KNOWLEDGE CORE  │
                 └────────┬────────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
           Concepts    Evidence    Sources
              │           │           │
              └───────────┼───────────┘
                          ▼
                 RELATIONSHIP GRAPH
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
       Security           ML          Infrastructure
       Perspective     Perspective      Perspective
          │               │                │
          └───────────────┼────────────────┘
                          ▼
                   GRAPH + CANVAS
                          │
                          ▼
                     GraphRAG
                          │
                          ▼
                 AI KNOWLEDGE ASSISTANT
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          LEARN         THINK        CREATE
             │            │            │
             ▼            ▼            ▼
        Flashcards     Research     Writing
```

The key architectural property is that **the graph is the persistent intellectual structure**, while AI providers are interchangeable reasoning and perception engines operating around that structure.

That makes the system capable of surviving changes in the AI market: a new model, a new provider, a better local model, or a completely different inference architecture should not require rebuilding the user's knowledge system.