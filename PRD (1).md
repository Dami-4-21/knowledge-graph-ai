# PRD.md
# AI-Native Personal Knowledge & Thinking Environment

**Version:** 2.0  
**Status:** Product Specification  
**Date:** August 2026  
**Product Type:** AI-powered Personal Knowledge Management / Knowledge Graph / Thinking Environment

---

# 1. Product Vision

Build an AI-native knowledge environment where users can **capture, understand, connect, explore, question, and create knowledge**.

The system should not merely store notes or display an automatically generated graph.

It should become a **thinking workspace**.

A user should be able to write a short note today, forget about it for six months, then return and discover:

> "This concept you wrote about Operating Systems is strongly related to this Machine Learning concept you captured four months later."

The system should explain **why** the relationship exists, provide evidence, assign a confidence score, and allow the user to explore the relationship from different perspectives.

The core loop is:

```text
CAPTURE
   ↓
UNDERSTAND
   ↓
EXTRACT
   ↓
CONNECT
   ↓
EXPLORE
   ↓
THINK
   ↓
CREATE
   ↓
REMEMBER
   ↓
NEW KNOWLEDGE
   ↺
```

The product should combine ideas from:

- Personal Knowledge Management
- Knowledge Graphs
- GraphRAG
- Semantic Search
- Zettelkasten
- Spatial Thinking
- Outliners
- AI Agents
- Multimodal AI
- Active Recall
- Local-first software

without becoming dependent on any one existing product paradigm.

---

# 2. Problem

Modern knowledge workers consume information across many sources:

- Articles
- Books
- Documentation
- Courses
- YouTube videos
- PDFs
- Research papers
- Conversations
- Code
- Screenshots
- Images
- Voice notes
- Personal observations
- AI conversations

The problem is not a lack of information.

The problem is that knowledge becomes fragmented.

A user may have:

```text
Note A
"Operating systems manage processes."

Note B
"CPU scheduling can be optimized."

Note C
"Reinforcement learning can optimize scheduling."

Note D
"Kernel vulnerabilities expose privileged operations."

Note E
"System calls form an attack surface."
```

A traditional notes application stores these independently.

A conventional semantic search engine may retrieve them when explicitly asked.

Our system should go further.

It should understand:

```text
Operating Systems
        │
        ├── Processes
        │      │
        │      └── Scheduling
        │             │
        │             └── Reinforcement Learning
        │
        ├── Kernel
        │      │
        │      └── Privilege
        │             │
        │             └── Security
        │
        └── System Calls
               │
               └── Attack Surface
```

And explain:

> "Your Machine Learning notes are connected to your Operating Systems notes through CPU scheduling and resource optimization."

---

# 3. Product Principles

## 3.1 User owns the knowledge

The user's knowledge must never depend on a particular AI provider.

The user must be able to switch between:

- OpenAI
- Anthropic Claude
- Google Gemini
- Ollama
- NVIDIA-hosted models
- OpenRouter
- Mistral
- Groq
- Together AI
- LM Studio
- Local inference servers
- Custom OpenAI-compatible APIs
- Custom HTTP APIs

without rebuilding their knowledge base.

---

## 3.2 AI is an engine, not the product

AI should enhance the user's thinking.

The application must remain useful when:

```text
AI unavailable
      ↓
notes still accessible
      ↓
graph still accessible
      ↓
search still works
      ↓
manual relationships still work
```

AI is an intelligence layer over the user's knowledge.

---

## 3.3 User-created relationships and AI-created relationships are different

The system must distinguish:

```text
USER_CREATED
AI_DISCOVERED
IMPORTED
INFERRED
TEMPORARY
```

AI must never silently overwrite the user's explicit knowledge.

---

## 3.4 Every AI conclusion should be explainable

Instead of:

> "These concepts are 87% related."

The system should provide:

```text
Relationship Strength: 87%

Why:
• Both concepts reference CPU scheduling.
• Both discuss resource allocation.
• Note A discusses scheduling algorithms.
• Note B discusses ML-based scheduling optimization.

Evidence:
Note #182 → Block #7
Note #341 → Block #3
```

---

# 4. Target Users

## 4.1 Developers

People learning:

- Programming
- Operating systems
- Networking
- Infrastructure
- Cloud
- Cybersecurity
- AI
- Distributed systems

---

## 4.2 Researchers

People working with:

- Academic papers
- PDFs
- Research notes
- Experiments
- Citations
- Literature reviews

---

## 4.3 Students

People learning complex interconnected subjects.

---

## 4.4 Technical Professionals

Examples:

- Software engineers
- Security engineers
- DevOps engineers
- ML engineers
- System administrators
- Architects
- Data scientists

---

## 4.5 Knowledge Workers

Anyone who continuously consumes and creates information.

---

# 5. Core Product Model

The application consists of six fundamental layers.

```text
┌─────────────────────────────────────┐
│             CAPTURE                 │
├─────────────────────────────────────┤
│ Notes / Blocks / Files / Web / Voice│
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│          KNOWLEDGE OBJECTS          │
├─────────────────────────────────────┤
│ Concepts / Entities / Sources       │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│          RELATIONSHIP ENGINE        │
├─────────────────────────────────────┤
│ Semantic / Explicit / Inferred      │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│             GRAPH                   │
├─────────────────────────────────────┤
│ Knowledge Graph / Canvas / Views     │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│          INTELLIGENCE               │
├─────────────────────────────────────┤
│ GraphRAG / Agents / Search / AI     │
└─────────────────┬───────────────────┘
                  ↓
┌─────────────────────────────────────┐
│             OUTPUT                  │
├─────────────────────────────────────┤
│ Writing / Research / Learning       │
│ Flashcards / Reports / Publishing   │
└─────────────────────────────────────┘
```

---

# 6. Knowledge Objects

Knowledge is not represented only as notes.

The system must support:

```text
Workspace
├── Notes
├── Blocks
├── Concepts
├── Entities
├── Sources
├── Documents
├── Images
├── Audio
├── Video
├── Projects
├── Daily Notes
└── Collections
```

---

# 7. Note Types

The system should support explicit note types.

## 7.1 Fleeting Note

Quick capture.

Example:

> "Interesting idea: maybe reinforcement learning could optimize network routing."

---

## 7.2 Literature Note

Derived from an external source.

Contains:

- Source
- Author
- URL
- Publication
- Highlights
- Summary
- Concepts

---

## 7.3 Permanent Note

A refined, durable idea.

Example:

> "Reinforcement learning can be applied to dynamic resource allocation problems."

---

## 7.4 Project Note

Associated with a project.

---

## 7.5 Daily Note

Chronological capture.

Example:

```text
August 10, 2026

08:30
Read about Linux scheduling.

11:15
Discovered relationship between scheduling and RL.

18:40
Learned about CFS.
```

---

## 7.6 Reference Note

Documentation or source material.

---

# 8. Block-Level Knowledge

The block is a first-class object.

A note may contain:

```text
Note
│
├── Block A
├── Block B
├── Block C
└── Block D
```

Each block has its own:

- ID
- Content
- Position
- Parent
- Type
- Embedding
- Concepts
- References

Users can reference blocks directly.

Example:

```text
((block-id))
```

The application should support:

- Block references
- Block embeds
- Transclusion
- Block backlinks
- Block-level graph relationships

This allows atomic knowledge.

---

# 9. Capture

Capture must be extremely fast.

Target:

> **Capture an idea in less than 3 seconds.**

Supported inputs:

- Text
- Markdown
- Clipboard
- URL
- Web article
- Screenshot
- Image
- PDF
- Audio
- Video
- Voice
- Drag-and-drop files
- Browser extension
- Mobile quick capture
- API
- Webhooks

---

# 10. Multimodal Knowledge

Knowledge objects may contain:

```text
Text
Image
PDF
Audio
Video
Code
Diagram
Screenshot
```

AI should extract knowledge from each.

Example:

User uploads:

```text
architecture.png
```

AI identifies:

```text
Load Balancer
API Gateway
Authentication Service
PostgreSQL
Redis
Worker
```

The system creates concepts and relationships.

---

# 11. AI Provider Abstraction

## 11.1 Core Requirement

The system must have a **Provider Abstraction Layer**.

The application must never directly depend on OpenAI, Anthropic, Ollama, NVIDIA, etc.

Instead:

```text
Application
     ↓
AI Provider Interface
     ↓
Provider Adapter
     ↓
Model
```

---

# 12. Supported AI Providers

Initial provider ecosystem:

### Cloud

- OpenAI
- Anthropic
- Google Gemini
- Mistral
- Groq
- Together AI
- OpenRouter
- NVIDIA NIM / NVIDIA-hosted inference
- Other compatible APIs

### Local

- Ollama
- LM Studio
- llama.cpp servers
- vLLM
- NVIDIA NIM
- Custom local inference server

### Custom

Users can configure:

```text
Provider Name
Base URL
API Key
Model
Authentication Method
Capabilities
```

---

# 13. OpenAI-Compatible Providers

The system should support generic OpenAI-compatible APIs.

Example:

```text
Base URL:
https://example.com/v1

API Key:
********

Model:
my-model
```

This allows compatibility with many current and future providers.

---

# 14. AI Capability Matrix

A provider/model should advertise capabilities.

```text
Model
├── chat
├── reasoning
├── embeddings
├── vision
├── audio_input
├── audio_output
├── structured_output
├── tool_calling
├── long_context
└── image_generation
```

The system should select models based on required capabilities.

---

# 15. Model Routing

Different AI tasks should use different models.

Example:

```text
Simple classification
        ↓
Cheap / fast model

Entity extraction
        ↓
Small structured-output model

Embedding
        ↓
Embedding model

Complex relationship reasoning
        ↓
Strong reasoning model

Large research question
        ↓
High-context reasoning model

Local/private note
        ↓
Ollama model
```

The user can override routing.

---

# 16. AI Routing Policies

Users can define:

```text
Policy: Cost Optimized
Policy: Quality Optimized
Policy: Privacy First
Policy: Local Only
Policy: Balanced
```

Example:

### Privacy First

```text
Extraction → Ollama
Embeddings → Local
Graph reasoning → Ollama
No cloud transmission
```

### Quality First

```text
Extraction → OpenAI
Reasoning → Claude
Embeddings → OpenAI
Vision → Gemini
```

---

# 17. AI Provider Failover

If a model fails:

```text
OpenAI
   ↓ failure
Claude
   ↓ failure
Ollama
```

The system should optionally fail over automatically.

The user must be able to disable automatic failover.

---

# 18. AI Cost Management

The system must track:

- Token usage
- Requests
- Model
- Provider
- Estimated cost
- Processing time
- Cache hits
- Embedding usage

Users can configure:

```text
Daily budget
Monthly budget
Per-task budget
Per-model budget
```

---

# 19. Embedding Engine

Every relevant knowledge object may receive an embedding.

Examples:

```text
Note embedding
Block embedding
Concept embedding
Source embedding
Relationship embedding
```

The embedding provider must be configurable.

Supported:

- OpenAI embeddings
- Local embedding models
- Hugging Face models
- Ollama embeddings
- Custom embedding APIs

---

# 20. Embedding Storage

The architecture should support:

- PostgreSQL + pgvector
- Qdrant
- Weaviate
- Milvus
- Chroma
- Local vector database

MVP recommendation:

```text
PostgreSQL
+
pgvector
```

The vector layer must remain abstracted.

---

# 21. Knowledge Extraction Pipeline

When a user creates a note:

```text
Note created
      ↓
Normalize
      ↓
Chunk into blocks
      ↓
Extract entities
      ↓
Extract concepts
      ↓
Extract keywords
      ↓
Generate embeddings
      ↓
Find candidate relationships
      ↓
Reason over candidates
      ↓
Calculate relationship score
      ↓
Store graph relationships
      ↓
Update indexes
```

---

# 22. Relationship Engine

Relationships are the heart of the product.

A relationship should contain:

```text
Source
Target
Type
Strength
Confidence
Evidence
Perspective
Origin
Created At
Updated At
Model
```

---

# 23. Relationship Types

Initial types:

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

The system should allow custom relationship types.

---

# 24. Relationship Strength

Every relationship has a normalized score:

```text
0.00 → 1.00
```

UI representation:

```text
0–20%      Very weak
21–40%     Weak
41–60%     Moderate
61–80%     Strong
81–100%    Very strong
```

The score is not a claim of objective truth.

It represents the system's estimated relevance based on available evidence.

---

# 25. Relationship Confidence vs Strength

These must be separate.

Example:

```text
Relationship Strength: 91%

Confidence: 62%
```

Meaning:

> The concepts appear highly related, but the AI is not very confident about the exact relationship.

---

# 26. Relationship Evidence

Every AI-created relationship should maintain evidence.

Example:

```text
Operating Systems
        ↓
CPU Scheduling
        ↓
Reinforcement Learning
```

Evidence:

```text
Note #104
Block #8

"Scheduling decisions can be optimized using reinforcement learning."
```

The user can click the relationship and inspect its evidence.

---

# 27. Knowledge Graph

The graph consists of:

```text
Nodes
+
Edges
+
Properties
+
Evidence
+
Weights
+
Perspectives
+
History
```

Nodes can be:

```text
Note
Block
Concept
Entity
Source
Document
Image
Person
Technology
Project
```

---

# 28. Graph Views

The application must provide:

### Global Graph

Entire knowledge base.

### Local Graph

Selected node and nearby relationships.

### Concept Graph

Concepts only.

### Note Graph

Notes only.

### Block Graph

Atomic ideas.

### Project Graph

Project-specific knowledge.

### Timeline Graph

Knowledge evolution over time.

---

# 29. Perspective Engine

Perspective is a core feature.

Users can select:

```text
Security
Machine Learning
Networking
Infrastructure
DevOps
Operating Systems
Cloud
Programming
Business
Research
Custom Perspective
```

The graph then changes according to that perspective.

---

# 30. Perspective Model

The underlying graph remains the same.

Perspective changes:

```text
Relationship relevance
Relationship weights
Node importance
Cluster visibility
AI retrieval
Graph layout
Explanations
```

Example:

```text
                    Operating System
                          │
              ┌───────────┼───────────┐
              ↓           ↓           ↓
           Kernel      Memory      Scheduler
```

Security perspective:

```text
Kernel ───────► Privilege Escalation
Memory ───────► Memory Corruption
Scheduler ────► Isolation
```

ML perspective:

```text
Scheduler ────► Reinforcement Learning
Memory ───────► Cache Prediction
Kernel ───────► System Optimization
```

---

# 31. Perspective Score

Each relationship may have:

```text
global_strength
security_strength
ml_strength
network_strength
infrastructure_strength
...
```

Perspectives can also be dynamically generated.

Example:

> "Show me this graph from the perspective of performance optimization."

The AI generates a temporary perspective.

---

# 32. Perspective Comparison

Users can compare:

```text
Security vs ML
```

The interface should display:

- Shared concepts
- Security-specific relationships
- ML-specific relationships
- Conflicts
- Missing connections
- Perspective scores

Future versions may provide visual overlays.

---

# 33. Spatial Canvas

The application must include an infinite canvas.

Users can:

- Drag nodes
- Arrange concepts
- Group nodes
- Create clusters
- Add cards
- Draw relationships
- Add text
- Add images
- Embed notes
- Embed blocks
- Add PDFs
- Annotate diagrams

The canvas is a **manual thinking space**.

---

# 34. AI + Canvas

AI should understand the canvas.

Example:

User selects:

```text
Kernel
Memory
Process
Network
```

and asks:

> "Organize these into an architecture."

AI can create:

```text
Kernel
 ├── Process Management
 ├── Memory Management
 └── Networking
```

The user remains in control.

---

# 35. Manual Relationships

Users can create explicit relationships.

Example:

```text
Concept A
      ↓
[manually connected]
      ↓
Concept B
```

The AI may subsequently suggest:

```text
Suggested relationship type:
DEPENDS_ON

Confidence:
89%
```

The user can accept or reject it.

---

# 36. AI Relationship Suggestions

AI should periodically identify:

- New relationships
- Missing relationships
- Contradictions
- Duplicate concepts
- Similar notes
- Orphan concepts
- Weakly connected areas

---

# 37. Contradiction Detection

The system should identify potential contradictions.

Example:

Note A:

> "Processes share memory."

Note B:

> "Processes have isolated address spaces."

AI should report:

```text
Potential contradiction detected.

These statements may refer to different memory models.

Would you like to investigate?
```

It must not automatically decide which statement is correct.

---

# 38. Knowledge Evolution

The graph must support historical evolution.

Users should be able to see:

```text
What did I believe in January?

What changed in March?

What concepts became stronger?

Which relationships disappeared?

Which concepts became central?
```

---

# 39. Graph Diff

Users can select:

```text
Today
vs
30 days ago
```

and see:

```text
+ 24 concepts
+ 53 relationships
- 4 relationships
↑ 12 strengthened
↓ 7 weakened
```

---

# 40. Agentic Knowledge Maintenance

The system should support background AI agents.

Agents include:

### Knowledge Curator

Finds duplicate and weak notes.

### Relationship Agent

Discovers new connections.

### Contradiction Agent

Finds conflicting statements.

### Staleness Agent

Identifies outdated information.

### Taxonomy Agent

Improves concept organization.

### Research Agent

Monitors selected sources.

### Learning Agent

Generates review material.

Agents must require configurable permissions.

---

# 41. Agent Permission Model

Users control:

```text
Read Notes
Read Files
Create Concepts
Create Relationships
Modify Tags
Modify Notes
Delete Notes
External Web Access
Send Notifications
```

Default:

```text
Read: allowed
Suggest: allowed
Modify: approval required
Delete: forbidden
```

---

# 42. GraphRAG

The AI assistant must use the knowledge graph during retrieval.

Instead of:

```text
Question
 ↓
Vector Search
 ↓
LLM
```

use:

```text
Question
 ↓
Query Decomposition
 ↓
Semantic Retrieval
 ↓
Graph Traversal
 ↓
Relationship Filtering
 ↓
Evidence Retrieval
 ↓
Context Construction
 ↓
LLM
 ↓
Cited Answer
```

---

# 43. GraphRAG Example

User:

> "How are operating systems related to machine learning in my knowledge base?"

The system retrieves:

```text
Operating Systems
 ↓
CPU Scheduling
 ↓
Optimization
 ↓
Reinforcement Learning
```

and answers using the user's actual notes.

---

# 44. AI Assistant

The assistant should support:

```text
Ask my knowledge
Explain
Compare
Find connections
Find contradictions
Summarize
Teach me
Generate questions
Write
Research
Explore
```

Every answer should cite the user's knowledge objects where applicable.

---

# 45. Structured Queries

Power users should be able to query the graph.

Example:

```text
concepts
WHERE type = "Technology"
AND connections > 5
```

Another:

```text
notes
WHERE perspective = "security"
AND confidence > 0.8
```

The query system should eventually support a human-readable syntax.

---

# 46. Natural Language Queries

Users should also be able to ask:

> "Show me technologies connected to Linux through security concepts."

The system translates this into graph operations.

---

# 47. Search

Search must support:

### Keyword

```text
kernel
```

### Semantic

```text
memory isolation
```

### Graph

```text
things connected to Linux
```

### Hybrid

```text
semantic + graph + metadata
```

---

# 48. Long-Form Writing

The system must support knowledge-assisted writing.

User:

> "Write an article about the relationship between operating systems and cybersecurity using my notes."

AI should:

1. Retrieve relevant knowledge
2. Build an outline
3. Cite source notes
4. Draft
5. Identify missing evidence
6. Allow editing

---

# 49. Citation System

Every knowledge-derived claim should be traceable.

Example:

```text
[1] Note: Linux Memory Management
[2] Block: Kernel Isolation
[3] PDF: Operating System Concepts
```

Future support:

- APA
- MLA
- Chicago
- IEEE
- BibTeX

---

# 50. Active Recall

The system should convert knowledge into learning material.

Examples:

```text
Flashcards
Questions
Quizzes
Concept explanations
Fill-in-the-blank
```

---

# 51. Spaced Repetition

The system should calculate review priority based on:

```text
Knowledge importance
Relationship centrality
User confidence
Previous review
Difficulty
Recency
```

---

# 52. Daily Knowledge Review

Each day the system may show:

```text
Today's Knowledge Review

3 concepts you haven't reviewed
2 new relationships discovered
1 contradiction detected
4 notes related to yesterday's research
```

---

# 53. Templates

Users can create templates.

Example:

```text
Literature Note

Title:
Author:
Source:
Summary:
Key Concepts:
Important Claims:
Questions:
Related Concepts:
```

AI can suggest templates based on content.

---

# 54. Outliner Mode

The editor should support an outliner.

Example:

```text
Operating Systems
    Kernel
        Process Management
        Memory Management
        Scheduling
    File Systems
    Networking
```

Each bullet is a block.

---

# 55. Local-First Architecture

The application should support local-first usage.

Canonical local data:

```text
Markdown
+
JSON metadata
+
local database
```

Users should be able to export their complete knowledge base.

---

# 56. Data Ownership

Users should be able to export:

```text
Markdown
JSON
CSV
PDF
HTML
GraphML
JSON-LD
```

No vendor lock-in.

---

# 57. Offline Mode

The core application should work offline.

Offline features:

- Notes
- Blocks
- Editing
- Canvas
- Local graph
- Local search
- Local embeddings
- Local AI

Cloud AI becomes optional.

---

# 58. Privacy

The system must clearly indicate when information leaves the device.

Example:

```text
AI Provider:
Ollama
Location:
Local
Data leaves device:
NO
```

Cloud provider:

```text
AI Provider:
OpenAI
Location:
Cloud
Data leaves device:
YES
```

---

# 59. Encryption

Support:

- Encryption at rest
- TLS
- Encrypted backups
- Optional end-to-end encrypted synchronization

---

# 60. Collaboration

The architecture should be compatible with real-time collaboration.

Preferred direction:

```text
CRDT / local-first synchronization
```

Collaboration should eventually support:

- Shared notes
- Shared canvases
- Shared graphs
- Comments
- Presence
- Permissions

Collaboration is not required for MVP but must not block future implementation.

---

# 61. Mobile

Mobile should prioritize:

```text
Quick Capture
Voice
Camera
Screenshot
Search
Read
Review
```

The full graph/canvas editor may initially be desktop-first.

---

# 62. Browser Extension

The browser extension should support:

```text
Save page
Save selection
Highlight
Save image
Save quote
Save URL
```

AI automatically creates metadata and relationships.

---

# 63. Web Clipping

A clipped article should preserve:

```text
Title
URL
Author
Date
Selected text
Full text when permitted
Highlights
Concepts
Relationships
```

---

# 64. PDF Processing

PDF pipeline:

```text
PDF
 ↓
Text extraction
 ↓
OCR if required
 ↓
Page segmentation
 ↓
Highlight extraction
 ↓
Concept extraction
 ↓
Embeddings
 ↓
Graph integration
```

Every extracted concept should retain page-level provenance.

---

# 65. Audio and Video

Pipeline:

```text
Audio / Video
 ↓
Transcription
 ↓
Speaker detection
 ↓
Segmentation
 ↓
Concept extraction
 ↓
Embeddings
 ↓
Relationships
```

Users should be able to jump from a concept back to the timestamp where it appeared.

---

# 66. Knowledge Provenance

Every extracted fact should have provenance.

Example:

```text
Concept:
Virtual Memory

Source:
Operating Systems lecture

Page:
42

Block:
#8

Created:
2026-08-10

AI extraction:
Ollama / model-x
```

---

# 67. Duplicate Detection

The system should detect:

```text
Duplicate notes
Similar notes
Duplicate concepts
Alias concepts
```

Example:

```text
"OS Kernel"
"Operating System Kernel"
"Kernel"
```

may represent the same concept.

The system should suggest merging rather than silently merge.

---

# 68. Concept Canonicalization

Each concept should have:

```text
Canonical Name
Aliases
Definition
Type
Description
Embeddings
Relationships
Sources
History
Perspectives
```

---

# 69. Knowledge Confidence

Confidence can exist at:

```text
Concept level
Relationship level
Claim level
Source level
```

Example:

```text
Concept confidence: 95%
Claim confidence: 61%
Relationship confidence: 83%
```

---

# 70. Graph Visualization

Graph visualization should support:

- Zoom
- Pan
- Search
- Filtering
- Clustering
- Expand/collapse
- Timeline
- Perspective
- Relationship strength
- Node importance
- Manual positioning

---

# 71. Graph Filters

Users can filter:

```text
Relationship strength
Perspective
Date
Source
Note type
Concept type
AI-generated
User-created
Confidence
```

---

# 72. Community Detection

The system should identify clusters.

Example:

```text
Cybersecurity
├── Authentication
├── Authorization
├── Cryptography
└── Network Security
```

Clusters can be automatically named by AI.

---

# 73. Orphan Detection

The system should identify concepts that have:

```text
0 relationships
```

or very weak connectivity.

AI may suggest:

> "This concept appears related to these 4 existing concepts."

---

# 74. Knowledge Gaps

AI should identify missing connections.

Example:

```text
You know:

Linux
Networking
Containers
Kubernetes

But you have almost no notes connecting:

Linux → Networking → Containers
```

The system may suggest a learning path.

---

# 75. Learning Paths

AI can generate:

```text
Concept A
 ↓
Concept B
 ↓
Concept C
 ↓
Concept D
```

based on the user's existing knowledge.

---

# 76. Personal Knowledge Graph Assistant

The AI should be able to say:

> "You have strong knowledge around Linux and networking, but relatively weak knowledge connecting them to distributed systems."

This turns the graph into a learning map.

---

# 77. Dashboard

The dashboard should display:

```text
Knowledge Growth
New Concepts
New Relationships
Most Connected Concepts
Recent Notes
Knowledge Gaps
Contradictions
AI Suggestions
Review Queue
```

---

# 78. Main Interface

Desktop layout:

```text
┌────────────────────────────────────────────────────┐
│ Search        AI Assistant       Perspective        │
├───────────┬────────────────────────┬───────────────┤
│           │                        │               │
│ Timeline  │      Editor / Canvas   │ Knowledge     │
│           │                        │ Graph         │
│ Notes     │                        │               │
│           │                        │               │
│ Projects  │                        │               │
│           │                        │               │
└───────────┴────────────────────────┴───────────────┘
```

Panels should be resizable.

---

# 79. Keyboard-First

Important commands should have keyboard shortcuts.

Examples:

```text
Ctrl/Cmd + P
Search

Ctrl/Cmd + K
Command palette

Ctrl/Cmd + N
New note

Ctrl/Cmd + Shift + N
New daily note

Ctrl/Cmd + Enter
AI process

[[...
Link concept

((...
Reference block
```

---

# 80. Command Palette

The command palette should expose:

```text
Create note
Create concept
Create canvas
Search graph
Ask AI
Analyze note
Find relationships
Show backlinks
Generate flashcards
Change perspective
Export
```

---

# 81. AI Transparency

Every AI operation should show:

```text
Provider
Model
Task
Time
Tokens
Cost
```

Example:

```text
Analyzed using:
Ollama
llama3.3:70b

Cost:
$0.00

Location:
Local
```

---

# 82. AI Job System

AI operations should run as background jobs.

Examples:

```text
EmbeddingJob
ExtractionJob
RelationshipJob
VisionJob
TranscriptionJob
GraphRAGJob
AgentJob
FlashcardJob
```

Users should see progress.

---

# 83. Job Retry

Failed jobs should support:

```text
Retry
Retry with another model
Cancel
Ignore
```

---

# 84. AI Cache

AI results should be cached.

Cache keys should consider:

```text
Input hash
Model
Provider
Prompt version
Configuration
```

Changing the model should not necessarily invalidate unrelated cached operations.

---

# 85. Prompt Versioning

AI prompts must be versioned.

Example:

```text
relationship-extraction:v3
concept-extraction:v2
contradiction-detection:v1
```

This allows reproducibility.

---

# 86. AI Audit Log

Store:

```text
Task
Provider
Model
Prompt version
Input references
Output
Tokens
Cost
Timestamp
```

Sensitive prompt content should be configurable for privacy.

---

# 87. User Controls

Users should be able to configure:

```text
Default AI provider
Default model
Embedding provider
Vision provider
Transcription provider
Reasoning provider
Fallback provider
Privacy policy
Budget
```

---

# 88. Provider Configuration Example

```yaml
providers:

  openai:
    type: cloud
    base_url: https://api.openai.com/v1
    api_key: ENV
    models:
      - gpt-model

  anthropic:
    type: cloud
    api_key: ENV
    models:
      - claude-model

  ollama:
    type: local
    base_url: http://localhost:11434
    models:
      - llama
      - qwen

  nvidia:
    type: cloud
    base_url: CUSTOM
    api_key: ENV
```

This is illustrative; provider configuration should ultimately live in secure application settings rather than a committed file.

---

# 89. API

The application should expose an API for:

```text
Notes
Blocks
Concepts
Entities
Relationships
Graph
Canvas
Search
AI
Providers
Jobs
Agents
Files
Sources
```

---

# 90. External Integrations

Future integrations:

- GitHub
- Notion
- Obsidian
- Readwise
- Google Drive
- Dropbox
- OneDrive
- Zotero
- Pocket
- Browser
- YouTube
- RSS
- Email

---

# 91. Import

Supported imports:

```text
Markdown
HTML
JSON
CSV
PDF
Notion exports
Obsidian vaults
```

---

# 92. Export

Export must preserve:

```text
Notes
Blocks
Links
Relationships
Metadata
Sources
Concepts
```

---

# 93. Public Knowledge Publishing

Future capability:

```text
Private Knowledge
       ↓
Select Collection
       ↓
Publish
       ↓
Public Knowledge Site
```

Users can publish selected parts of their graph.

---

# 94. Security Requirements

The application must implement:

- Authentication
- Authorization
- Encryption
- Secure API keys
- Rate limiting
- Audit logs
- Input validation
- File scanning
- Sandboxed AI tools
- SSRF protection
- XSS protection
- CSRF protection
- Secure sessions

---

# 95. AI Security

AI agents must not automatically receive unrestricted access.

Tools should have explicit permissions.

Example:

```text
Agent
 ├── read_notes: YES
 ├── write_notes: YES
 ├── delete_notes: NO
 ├── internet: NO
 └── shell: NO
```

---

# 96. MVP

The MVP should focus on the fundamental thinking loop.

### Required

```text
Notes
Blocks
Markdown editor
Daily notes
Concept extraction
Embeddings
Knowledge graph
Relationship engine
Relationship confidence
Relationship evidence
Perspective mode
Semantic search
GraphRAG
AI assistant
AI provider abstraction
OpenAI-compatible provider support
Ollama support
Canvas
Import/export
Local-first storage
```

---

# 97. MVP AI Providers

At minimum:

```text
Ollama
OpenAI-compatible API
Anthropic
```

The architecture must allow adding providers without modifying application logic.

---

# 98. MVP Multimodal

MVP should support:

```text
Text
Images
PDF
```

Audio/video can follow immediately after MVP if implementation capacity allows.

---

# 99. MVP Canvas

MVP canvas:

```text
Infinite canvas
Cards
Concept nodes
Manual connections
Note embeds
Block embeds
Drag/drop
Zoom
Pan
AI organization
```

---

# 100. MVP Perspective

MVP should include:

```text
Global
Security
Machine Learning
Networking
Infrastructure
Custom
```

Users can create custom perspectives.

---

# 101. Version 1

Add:

```text
Audio
Video
Browser extension
Flashcards
Spaced repetition
Knowledge evolution
Contradiction detection
Agentic maintenance
Advanced GraphRAG
Structured queries
```

---

# 102. Version 2

Add:

```text
Collaboration
CRDT synchronization
Public publishing
Advanced PDF annotation
External integrations
Research workflows
Advanced programmable views
```

---

# 103. Non-Goals

The application is not intended to become:

- A generic project management application
- A social network
- A conventional document editor
- A replacement for Git
- A generic chatbot
- A cloud-only AI application

The core product remains:

> **A personal environment for understanding and developing knowledge.**

---

# 104. Success Metrics

## Knowledge Capture

```text
Daily captures/user
Weekly active users
Notes created
Blocks created
Sources imported
```

## Knowledge Connectivity

```text
Relationships/user
Concepts/user
Average graph density
Orphan concept rate
AI relationship acceptance rate
```

## AI

```text
AI suggestion acceptance
AI response quality
Cost/user
Latency
Provider failure rate
Cache hit rate
```

## Learning

```text
Reviews completed
Flashcards generated
Knowledge gaps resolved
```

---

# 105. Core Differentiator

The product should not compete by saying:

> "We have AI notes."

It should communicate:

> **"Your knowledge learns how your knowledge is connected."**

The graph is not decoration.

The AI is not merely a chatbot.

The canvas is not merely a whiteboard.

The notes are not merely documents.

Together they form a personal knowledge system.

---

# 106. Example User Journey

User reads an article about Linux.

They highlight:

> "The Linux scheduler determines which task runs next."

The system creates:

```text
Concept:
CPU Scheduling
```

It finds an existing concept:

```text
Operating Systems
```

Relationship:

```text
CPU Scheduling
      ↓
PART_OF
      ↓
Operating Systems
```

Three months later the user writes:

> "Reinforcement learning could potentially optimize scheduling policies."

The system discovers:

```text
Reinforcement Learning
        │
        ▼
Scheduling
        │
        ▼
Operating Systems
```

Relationship:

```text
Strength: 91%
Confidence: 84%
```

The user selects:

```text
ML Perspective
```

The graph expands to reveal:

```text
Operating Systems
       ↓
Scheduling
       ↓
Optimization
       ↓
Reinforcement Learning
```

The user then selects:

> "Security Perspective"

The graph changes:

```text
Operating Systems
       ↓
Kernel
       ↓
Privilege
       ↓
Privilege Escalation
```

The underlying knowledge hasn't changed.

The **lens through which the user thinks about the knowledge has changed**.

---

# 107. Final Product Definition

This product is a:

> **Local-first, AI-native personal knowledge and thinking environment built around atomic knowledge objects, semantic relationships, graph reasoning, spatial thinking, multimodal understanding, configurable AI providers, and perspective-driven exploration.**

The system should allow a user to choose:

```text
HOW I STORE MY KNOWLEDGE
        +
HOW AI UNDERSTANDS IT
        +
HOW I EXPLORE IT
        +
HOW I THINK ABOUT IT
        +
HOW I CREATE FROM IT
```

without forcing them into a specific AI provider, cloud platform, database, or proprietary knowledge format.

---

# 108. Guiding Architecture Principle

The most important architectural rule is:

```text
                 USER KNOWLEDGE
                       │
                       ▼
              ┌─────────────────┐
              │ KNOWLEDGE CORE  │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       OpenAI       Claude       Ollama
          │            │            │
          ▼            ▼            ▼
       NVIDIA       Gemini      Local LLM
          │            │            │
          └────────────┼────────────┘
                       │
                       ▼
                AI ABSTRACTION
                       │
                       ▼
              KNOWLEDGE GRAPH
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
           Graph      Canvas    Search
             │         │         │
             └─────────┼─────────┘
                       ▼
                  USER THINKING
```

**No AI provider owns the knowledge.**

**No visualization owns the graph.**

**No cloud service owns the user's data.**

The knowledge core belongs to the user, and AI providers are interchangeable intelligence engines connected to it.