# TID — Technical Infrastructure Document
# Knowledge Graph AI

**Version:** 1.0  
**Date:** 2026-08-14  
**Environment:** Linux / Kali Linux (x86_64)

---

## 1. Project Overview

An AI-powered personal knowledge graph application. Users write notes; the AI extracts concepts, relationships, acronyms, and learning gaps, visualizing them as an interactive graph.

---

## 2. Repository Structure

```
knowledge-graph-ai/
├── server.ts                          # Express backend entry point
├── vite.config.ts                     # Vite frontend build config
├── tsconfig.json                      # TypeScript config (ESNext, ESM)
├── package.json                       # Node.js dependencies & scripts
├── .env                               # 🔒 Secret env vars (gitignored)
├── .env.example                       # Env var template (committed)
├── .dockerignore                      # Docker build exclusions
├── Dockerfile                         # Multi-stage Docker image
├── docker-compose.yml                 # Service orchestration
├── session.md                         # Session log
├── TID.md                             # This document
├── README.md                          # User-facing documentation
│
├── src/
│   ├── main.tsx                       # React entry point
│   ├── App.tsx                        # Root component
│   ├── index.css                      # Global styles
│   ├── types.ts                       # All TypeScript types & AI provider defaults
│   │
│   ├── context/
│   │   └── KnowledgeGraphContext.tsx  # Global state (notes, concepts, relationships, AI config)
│   │
│   ├── components/
│   │   ├── KnowledgeGraph.tsx         # Main graph canvas (D3 / force-directed)
│   │   ├── SettingsStatsModal.tsx     # AI provider settings + stats UI
│   │   ├── NoteEditor.tsx             # Note creation/editing panel
│   │   ├── ConceptPanel.tsx           # Concept detail panel
│   │   └── ...                        # Other UI components
│   │
│   ├── services/
│   │   └── ai/
│   │       ├── OpenRouterProvider.ts  # OpenRouter REST client (env-backed)
│   │       └── AIService.ts           # AI orchestration layer
│   │
│   └── utils/
│       └── graphAlgorithms.ts         # Graph traversal & layout utilities
│
└── scripts/
    ├── launch.sh                      # One-click Docker startup script
    └── stop.sh                        # Graceful container stop script

~/.local/share/applications/
└── knowledge-graph-ai.desktop         # Linux app launcher entry
```

---

## 3. Technology Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | React | 18.x |
| Build tool | Vite | Latest |
| Language | TypeScript | 5.x |
| Graph rendering | D3.js (force-directed) | — |
| State management | React Context + localStorage | — |
| Icons | lucide-react | — |
| Styling | Vanilla CSS (dark theme) | — |

### Backend
| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 22.23.2 |
| Framework | Express | 4.x |
| Language | TypeScript (via tsx) | — |
| TypeScript runner | tsx | — |
| Env loading | dotenv + dotenvx | — |
| HTTP client | Native `fetch` (Node 22 built-in) | — |

### AI
| Layer | Technology |
|---|---|
| Gateway | OpenRouter API (`https://openrouter.ai/api/v1`) |
| Default model | `openrouter/auto` (routes to best available) |
| Protocol | OpenAI-compatible chat completions |
| Auth | Bearer token from `OPENROUTER_API_KEY` env var |

### Infrastructure
| Layer | Technology | Version |
|---|---|---|
| Containerization | Docker | 28.5.2 |
| Orchestration | Docker Compose V2 | 2.36.2 |
| Base image | `node:22-alpine` | — |
| Package manager | npm | 10.9.8 (inside container) |

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│  React SPA (Vite)                                        │
│  ┌──────────────┐  ┌─────────────────┐  ┌────────────┐  │
│  │ KnowledgeGraph│  │SettingsStatsModal│  │ NoteEditor │  │
│  │  (D3 canvas) │  │ (AI provider UI) │  │            │  │
│  └──────┬───────┘  └────────┬────────┘  └─────┬──────┘  │
│         └──────────────────┬┘                  │         │
│                    KnowledgeGraphContext         │         │
│              (React Context + localStorage)      │         │
└──────────────────────┬──────────────────────────┘         │
                       │ HTTP (fetch to /api/*)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Express Backend (server.ts)                  │
│                                                           │
│  Routes:                                                  │
│  GET  /api/health              → health status            │
│  GET  /api/openrouter/models   → live model catalog       │
│  POST /api/test-connection     → provider connectivity    │
│  POST /api/extract-knowledge   → concept/relation extract │
│  POST /api/generate-perspective→ custom graph view        │
│  POST /api/discover-connections→ AI gap analysis          │
│  POST /api/explain-relationship→ deep relationship detail │
│  POST /api/ask-ai              → grounded Q&A assistant   │
│  POST /api/generate-learning-path → learning path gen     │
│                                                           │
│  getProvider() helper:                                    │
│  - If provider=openrouter & no UI key → inject .env key  │
│  - If no providerConfig → default to OpenRouter env       │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌─────────────────┐      ┌──────────────────────┐
│ OpenRouterProvider│      │  Other Provider paths │
│  (src/services/) │      │  (native fetch calls) │
│                  │      │  - Anthropic           │
│ - chat()         │      │  - Gemini (OAI compat) │
│ - callJSON()     │      │  - OpenAI              │
│ - listModels()   │      │  - Ollama / LM Studio  │
└────────┬─────────┘      │  - Groq, Together, etc │
         │                └──────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────┐
│              OpenRouter API                              │
│         https://openrouter.ai/api/v1                    │
│                                                          │
│  /chat/completions  →  Selected model                    │
│  /models            →  Live model catalog                │
│                                                          │
│  Default: openrouter/auto (routes to best free model)    │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | ✅ Yes | — | OpenRouter secret key. Get at openrouter.ai/keys |
| `OPENROUTER_BASE_URL` | No | `https://openrouter.ai/api/v1` | API base URL |
| `OPENROUTER_MODEL` | No | `openrouter/auto` | Model ID. Use `:free` suffix for free models |
| `OPENROUTER_HTTP_REFERER` | No | `https://knowledge-graph-ai.local` | Attribution header |
| `OPENROUTER_APP_TITLE` | No | `Knowledge Graph AI` | Attribution header |
| `PORT` | No | `3000` | Server listen port |
| `GEMINI_API_KEY` | No | — | Legacy fallback if Gemini selected in Settings |

---

## 6. Docker Infrastructure

### Image Build (Dockerfile)

```
Stage 1: builder (node:22-alpine)
  WORKDIR /app
  COPY package*.json → npm ci --ignore-scripts
  COPY . → npx vite build
  Output: /app/dist/ (frontend static files)

Stage 2: runner (node:22-alpine)
  WORKDIR /app
  COPY package*.json → npm ci --omit=dev --ignore-scripts
  COPY --from=builder /app/dist → ./dist
  COPY server.ts, src/services/, tsconfig.json
  CMD: npx tsx server.ts
```

**Why tsx instead of compiled JS:**  
`esbuild` bundling to CJS breaks `import.meta.url` (used for `__dirname` emulation in ESM). Running `tsx` directly avoids this entirely.

### Container Configuration (docker-compose.yml)

```yaml
service:    knowledge-graph-ai
image:      knowledge-graph-ai:latest
port:       0.0.0.0:3000 → 3000/tcp
restart:    unless-stopped
env_file:   .env
volume:     kg_data:/app/data  (named, persists data)
network:    kg_network (bridge)

healthcheck:
  test:         CMD-SHELL wget -qO- http://127.0.0.1:3000/api/health || exit 1
  interval:     15s
  timeout:      5s
  start_period: 40s
  retries:      5
```

**Healthcheck notes:**  
- Must use `CMD-SHELL` form (not `CMD`) — ensures BusyBox wget runs in a shell context  
- Must use `127.0.0.1` not `localhost` — avoids IPv6 resolution issues in Alpine  
- `start_period: 40s` — gives tsx time to compile TypeScript on first run  
- Healthcheck defined in `docker-compose.yml` only (removed from Dockerfile to avoid caching conflicts)

---

## 7. Networking

| Interface | Binding | Purpose |
|---|---|---|
| `0.0.0.0:3000` | All interfaces | Express server listens |
| `127.0.0.1:3000` | Loopback | Healthcheck probe target |
| `0.0.0.0:3000→3000` | Host port mapping | External browser access |

---

## 8. AI Provider Routing Logic

```typescript
// In getProvider() — server.ts
if (providerConfig.provider === 'openrouter' && !providerConfig.apiKey) {
  // Inject server-side key — never exposes key to browser
  return { ...cfg, apiKey: process.env.OPENROUTER_API_KEY }
}

// In callAI() — server.ts
if (!cfg || cfg.provider === 'openrouter') {
  → OpenRouterProvider.callJSON()   // uses env key
} else if (cfg.provider === 'anthropic') {
  → fetch Anthropic /v1/messages    // native Anthropic API
} else if (cfg.provider === 'gemini') {
  → fetch Gemini OpenAI-compat endpoint
} else {
  → fetch cfg.baseUrl/chat/completions  // OpenAI-compatible (all others)
}
```

---

## 9. API Endpoints Reference

| Method | Path | Body | Response | Description |
|---|---|---|---|---|
| GET | `/api/health` | — | `{status, provider, model, keyConfigured, timestamp}` | Readiness probe |
| GET | `/api/openrouter/models` | — | `{all: [...], free: [...]}` | Live model catalog |
| POST | `/api/test-connection` | `{providerConfig}` | `{success, message/error}` | Test AI connectivity |
| POST | `/api/extract-knowledge` | `{title, content, providerConfig}` | `{concepts, acronyms, relationships}` | Extract knowledge from note |
| POST | `/api/generate-perspective` | `{prompt, concepts, providerConfig}` | `{perspective}` | Generate custom graph view |
| POST | `/api/discover-connections` | `{notes, concepts, relationships, providerConfig}` | `{discoveries, knowledgeGaps}` | AI gap discovery |
| POST | `/api/explain-relationship` | `{sourceName, targetName, relationshipType, evidenceNotes, providerConfig}` | `{explanation, rationalePoints, evidenceQuotes, breakdown}` | Explain a relationship |
| POST | `/api/ask-ai` | `{query, notes, concepts, relationships, providerConfig}` | `{answer, sources, inferences, externalKnowledge}` | Grounded Q&A |
| POST | `/api/generate-learning-path` | `{targetDomain, currentConcepts, providerConfig}` | `{learningPath}` | Generate learning path |

---

## 10. Scripts & Launchers

### `scripts/launch.sh`
1. Checks Docker CLI exists
2. Checks Docker daemon is running → starts it via `systemctl` / `service` if not
3. Detects `docker compose` (V2) or `docker-compose` (V1)
4. Runs `docker compose up -d --build`
5. Polls `/api/health` in loop until responds (max 120s)
6. Opens browser: `xdg-open` → `x-www-browser` → `firefox` → `chromium`
7. On error: `notify-send` or `zenity` desktop notification
8. Logs to `/tmp/kg-ai-launch.log`

### `scripts/stop.sh`
1. Detects compose command
2. Runs `docker compose stop` (containers stopped, volumes preserved)
3. Warns that `down -v` would delete data

### `~/.local/share/applications/knowledge-graph-ai.desktop`
```ini
[Desktop Entry]
Type=Application
Name=Knowledge Graph AI
Exec=bash -c "exec /path/to/scripts/launch.sh > /tmp/kg-ai-launch.log 2>&1"
Icon=applications-science
Terminal=false
StartupNotify=true
Categories=Education;Science;Network;
```

---

## 11. Data Persistence

| Data | Storage | Location |
|---|---|---|
| Notes, concepts, relationships | `localStorage` (browser) | Per-browser origin |
| AI provider config | `localStorage` key: `kg_provider_config` | Per-browser origin |
| Server-side data (future) | Docker named volume `kg_data` | `/var/lib/docker/volumes/knowledge-graph-ai_kg_data/` |

**Important:** Currently all knowledge graph data lives in the browser's `localStorage`. Clearing browser data or switching browsers loses data. Docker volume is provisioned for future server-side persistence.

---

## 12. Security Model

| Concern | Approach |
|---|---|
| API key storage | Server-side only in `.env` — never sent to browser |
| API key in requests | Frontend sends empty `apiKey: ""` for OpenRouter; server injects from env |
| `.env` in git | `.gitignore` + `.dockerignore` exclude `.env` |
| Docker secrets | `env_file: .env` (not build-time ARG — key never baked into image layers) |
| Key in logs | `OpenRouterProvider` error messages never include the key string |
| CORS | Not configured — app is localhost-only |

---

## 13. Known Limitations & Future Work

| Item | Detail |
|---|---|
| Free model rate limits | `openrouter/auto` reduces this but doesn't eliminate it. Paid credits remove limits entirely. |
| localStorage only | No server-side backup of graph data yet. Volume is provisioned but unused. |
| No auth | App has no login — anyone on the local network can access port 3000 |
| Single-user | No multi-user or sync support |
| No export to graph DB | Could add Neo4j or similar for large graphs |
| Vite dev mode in Docker | Dev server (HMR) not used in Docker — production static build only |

---

## 14. Common Commands

```bash
# Start (Docker)
docker compose up -d

# Stop (preserves data)
docker compose stop

# Full remove (deletes containers, keeps volumes)
docker compose down

# Full remove including data volumes (⚠ DATA LOSS)
docker compose down -v

# View logs
docker compose logs -f

# Check health
curl http://localhost:3000/api/health

# List available free models
curl http://localhost:3000/api/openrouter/models | python3 -m json.tool

# Rebuild image after code changes
docker compose build && docker compose up -d

# Dev mode (no Docker)
export NVM_DIR="$HOME/.config/nvm" && source "$NVM_DIR/nvm.sh"
npm install && npm run dev

# One-click launch (via script)
./scripts/launch.sh

# Stop via script
./scripts/stop.sh
```

---

## 15. Dependency Inventory

### Runtime (server)
| Package | Purpose |
|---|---|
| `express` | HTTP server |
| `tsx` | TypeScript runner (ESM-native) |
| `dotenv` | `.env` file loading |
| `vite` | Frontend bundler |

### Frontend
| Package | Purpose |
|---|---|
| `react`, `react-dom` | UI framework |
| `d3` | Graph visualization |
| `lucide-react` | Icon library |

### Removed
| Package | Reason |
|---|---|
| `@google/genai` | Replaced with native `fetch` to OpenAI-compat Gemini endpoint |

---

*Generated at end of session — 2026-08-14T11:27 EDT*
