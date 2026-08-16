# Session Log — 2026-08-14

**Project:** Knowledge Graph AI  
**Location:** `/home/cube/Documents/BuildedByGoogle_Studio/knowledge-graph-ai`  
**Duration:** ~09:53 – 11:27 EDT  
**Goal:** Integrate OpenRouter as the AI provider, Dockerize the app, add a Linux desktop launcher, and write full documentation.

---

## 1. Context & Starting Point

The project was a Vite + React + Express (TypeScript) personal knowledge graph app. It already had:
- A multi-provider Settings UI (Gemini, OpenAI, Anthropic, Ollama, Groq, etc.)
- A backend `server.ts` that routed AI requests based on the `providerConfig` sent from the frontend
- The `@google/genai` SDK wired into the server
- No `.env` support for server-side key injection

The user's constraint: **do not delete the multi-provider Settings UI** — just make OpenRouter work as a first-class option with the API key loaded server-side from `.env`.

---

## 2. What Was Built — Step by Step

### Phase 1: AI Service Layer (Backend)

**Created `src/services/ai/OpenRouterProvider.ts`**
- Full OpenRouter REST client using native `fetch`
- Reads credentials exclusively from environment variables (`OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`)
- Typed error class `OpenRouterError` with codes: `MISSING_API_KEY`, `AUTHENTICATION_FAILED`, `MODEL_NOT_FOUND`, `RATE_LIMITED`, `INSUFFICIENT_CREDITS`, `CONTEXT_LIMIT`, `SERVICE_UNAVAILABLE`, `MALFORMED_RESPONSE`, `NETWORK_ERROR`
- Handles null/empty model responses (free-tier models sometimes return empty content)
- `listModels()` method to fetch live OpenRouter model catalog
- Singleton export `openRouterProvider`

**Created `src/services/ai/AIService.ts`**
- Thin orchestration layer
- Routes OpenRouter calls through `OpenRouterProvider` (with env key injection)
- Delegates other providers back to existing `server.ts` routing

**Rewrote `server.ts`**
- Removed `@google/genai` SDK dependency entirely
- Added `getProvider()` helper: injects `OPENROUTER_API_KEY` from env when OpenRouter is selected in UI with empty key field
- Added `/api/health` endpoint (used by Docker healthcheck and launcher)
- Added `/api/openrouter/models` endpoint (fetches live free model list)
- Added `/api/test-connection` endpoint
- Replaced Gemini SDK calls with OpenAI-compatible fetch (Gemini supports this natively)
- Preserved all 6 existing AI routes: `extract-knowledge`, `generate-perspective`, `discover-connections`, `explain-relationship`, `ask-ai`, `generate-learning-path`

### Phase 2: Frontend Changes

**`src/context/KnowledgeGraphContext.tsx`**
- Changed default provider from Gemini → OpenRouter
- First-launch defaults now use `AI_PROVIDER_DEFAULTS.openrouter` with empty API key (env key used automatically)

**`src/components/SettingsStatsModal.tsx`**
- Added imports: `Zap`, `Globe` from lucide-react
- Added state: `freeModels`, `loadingModels`, `showModels`
- Added purple env-key notice badge when OpenRouter is selected: *"Server-side key is loaded from `.env` automatically. Leave the field below empty to use it, or enter a different key to override."*
- Added API key placeholder text for OpenRouter: *"Leave empty to use server OPENROUTER_API_KEY"*
- Added **"Browse Free OpenRouter Models"** button — fetches `/api/openrouter/models` and shows a scrollable list; clicking a model name sets it in the model field

**`src/types.ts`**
- Changed OpenRouter default model from `meta-llama/llama-3.1-8b-instruct:free` → `openrouter/auto`

### Phase 3: Configuration Files

**`.env`** (gitignored, contains real key)
```
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openrouter/auto
OPENROUTER_HTTP_REFERER=https://knowledge-graph-ai.local
OPENROUTER_APP_TITLE=Knowledge Graph AI
PORT=3000
```

**`.env.example`** (committed, documents all variables)
- Lists all available env vars with descriptions
- Documents currently available free models as of Aug 2026

**Removed `@google/genai`** via `npm uninstall @google/genai` (36 packages removed)

### Phase 4: Docker

**`Dockerfile`** (multi-stage)
- Stage 1 (builder): `node:22-alpine` → `npm ci` → `vite build` (frontend only)
- Stage 2 (runner): `node:22-alpine` → prod deps → copies `dist/`, `server.ts`, `src/services/`, `tsconfig.json` → runs with `npx tsx server.ts`
- ESM/CJS bundling avoided by running `tsx` directly (avoids `import.meta.url` undefined error in CJS bundles)

**`docker-compose.yml`**
- Service: `knowledge-graph-ai`, image `knowledge-graph-ai:latest`
- Port: `3000:3000`
- `env_file: .env`
- Named volume: `kg_data` (persists server-side data)
- Network: `kg_network` (bridge)
- Healthcheck: `CMD-SHELL` form with `wget -qO- http://127.0.0.1:3000/api/health`
  - interval: 15s, timeout: 5s, start_period: 40s, retries: 5

**`.dockerignore`**
- Excludes: `node_modules`, `dist`, `.env`, `.env.*` (except `.env.example`), `.git`, logs, IDE files

### Phase 5: Scripts & Launcher

**`scripts/launch.sh`**
- Checks Docker is installed and daemon is running
- Attempts to start Docker daemon via `systemctl` or `service` if not running
- Detects `docker compose` (V2) or `docker-compose` (V1) automatically
- Runs `docker compose up -d --build`
- Polls `/api/health` in a loop until the app responds (no arbitrary sleep)
- Opens the browser via `xdg-open` / `firefox` / `chromium` fallback chain
- Shows desktop notification on error via `notify-send` / `zenity`

**`scripts/stop.sh`**
- Runs `docker compose stop` (preserves volume data)
- Explains difference between `stop` and `down -v`

Both scripts made executable with `chmod +x`.

**`~/.local/share/applications/knowledge-graph-ai.desktop`**
- Linux `.desktop` entry registered to application menu
- Runs `launch.sh` in background, logs to `/tmp/kg-ai-launch.log`
- Registered with `update-desktop-database`

### Phase 6: Documentation

**`README.md`** — Full rewrite covering:
- Architecture diagram
- Quick Start (configure `.env`, `docker compose up -d`)
- AI configuration guide (OpenRouter env key, model selection, provider switching)
- Health check endpoint
- Development mode (no Docker)
- Comprehensive troubleshooting table
- File structure

---

## 3. Problems Encountered & Fixed

| Problem | Root Cause | Fix |
|---|---|---|
| `import.meta.url` undefined in Docker | `esbuild` bundled server.ts as CJS — ESM features don't work | Dropped esbuild entirely; run `tsx server.ts` directly in container |
| Docker `npm ci` failed with `--no-cache` | `node:22-alpine` image pulled npm@12 which conflicted | Used cached build (no `--no-cache`); layers were valid |
| Container healthcheck "Connection refused" (Dockerfile form) | Docker `HEALTHCHECK CMD` form runs without a shell; BusyBox wget behaves differently | Moved healthcheck to `docker-compose.yml` using `CMD-SHELL` form |
| Free model 429 rate limit | `google/gemma-4-31b-it:free` has strict per-IP rate limits on free tier | Switched default to `openrouter/auto` which rotates across available models |
| `meta-llama/llama-3.1-8b-instruct:free` returned 404 | Model no longer available on OpenRouter | Fetched live model list; switched to available models |
| Empty model response error | Some free models return `null` content | Added explicit null/empty check in `OpenRouterProvider.chat()` with descriptive error |
| dotenvx caching old model value | `dotenvx` (wrapping tsx) cached encrypted env from previous run | Passed env vars explicitly on command line to bypass cache |

---

## 4. Verification Results

| Test | Result |
|---|---|
| `GET /api/health` | `{"status":"ok","provider":"openrouter","model":"openrouter/auto","keyConfigured":true}` ✅ |
| `POST /api/test-connection` with `openrouter/auto` | `{"success":true,"message":"Connected to OpenRouter successfully."}` ✅ |
| Docker build | `[+] Building (15/15) FINISHED` ✅ |
| Docker container health | `Up 55 seconds (healthy)` — `Status=healthy Failing=0` ✅ |
| `GET /api/openrouter/models` | Returns 18 currently available free models ✅ |
| `@google/genai` removed | 36 packages removed, 0 vulnerabilities ✅ |
| Docker Compose V2 plugin | Installed at `~/.docker/cli-plugins/docker-compose` v2.36.2 ✅ |

---

## 5. Current State (End of Session)

- **App running at:** http://localhost:3000 (Docker container, healthy)
- **Provider:** OpenRouter (`openrouter/auto` model)
- **Key:** Loaded from `.env` server-side — never sent to browser
- **Container:** `docker compose stop` to pause, `docker compose start` or `./scripts/launch.sh` to resume

---

# Session Log — 2026-08-14 (follow-up, ~14:34–14:47 EDT)

**Goal:** Debug "Network error contacting OpenRouter: fetch failed" and "No free models found" errors visible in the Settings UI.

---

## 6. Problem: Container Had No Outbound DNS Resolution

### Symptom
After the container restarted, the Settings UI showed:
- *"No free models found. Check your key or try again."* (`/api/openrouter/models` call failing)
- *"Network error contacting OpenRouter: fetch failed"* (all AI calls failing)

### Diagnosis

1. Checked container status — `Up 3 hours (healthy)` ✅ (server itself was fine)
2. Checked container logs — confirmed `fetch failed` errors originating from Node's native `fetch` trying to reach `https://openrouter.ai/api/v1`
3. Ran `wget` inside the container directly:
   ```
   docker exec knowledge-graph-ai wget -qO- https://openrouter.ai/api/v1/models
   → wget: bad address 'openrouter.ai'
   ```
4. Compared `/etc/resolv.conf` on host vs. container:
   - **Host:** `nameserver 192.168.1.1` (router DNS)
   - **Container:** `nameserver 127.0.0.11` with comment `# NO EXTERNAL NAMESERVERS DEFINED`

**Root cause:** Docker's internal resolver (`127.0.0.11`) was not forwarding queries to any external nameserver. The container could reach the Docker network but could not resolve any public hostnames. This occurs when Docker cannot inherit the host's DNS at container creation time (common on Kali/systemd-resolved setups).

### Fix

Added an explicit `dns:` block to `docker-compose.yml`:

```yaml
dns:
  - 192.168.1.1   # host router (matches /etc/resolv.conf)
  - 1.1.1.1       # Cloudflare fallback
  - 8.8.8.8       # Google fallback
```

Ran `docker compose up -d` to recreate the container with the new DNS config.

### Verification

```
docker exec knowledge-graph-ai wget -qO- https://openrouter.ai/api/v1/models
→ returns full JSON catalog (411 models) ✅
```

| Test | Result |
|---|---|
| Container DNS resolution | `openrouter.ai` resolves ✅ |
| OpenRouter model catalog | 411 models returned ✅ |
| "Browse Free OpenRouter Models" in UI | Populates correctly ✅ |
| "Test Connection" in UI | Success ✅ |

### Files Changed

| File | Change |
|---|---|
| `docker-compose.yml` | Added `dns: [192.168.1.1, 1.1.1.1, 8.8.8.8]` under the service |

---

## 7. Current State (End of Follow-up)

- **App running at:** http://localhost:3000 (Docker container, healthy)
- **DNS:** Explicitly set in `docker-compose.yml` — survives restarts
- **Provider:** OpenRouter (`openrouter/auto` model), API key loaded from `.env`
- **Model browsing & test connection:** Working ✅

---

# Session Log — 2026-08-15 (~05:54–06:07 EDT)

**Goal:** Debug recurring "Network error contacting OpenRouter: fetch failed" / ETIMEDOUT in the Settings UI Test Connection button.

---

## 8. Root Cause: Node.js `fetch` (undici) IPv6-first DNS on Docker Bridge

### Symptom
- `GET /api/health` → OK ✅
- `POST /api/test-connection` → `{"success":false,"error":"Network error contacting OpenRouter: fetch failed"}` ❌
- `wget https://openrouter.ai/api/v1/models` inside container → works ✅
- `node -e "require('https').get(...)"` inside container → works ✅
- `node -e "fetch(...)"` inside container → **ETIMEDOUT** ❌

### Diagnosis

1. DNS resolves both IPv4 (`104.18.2.115`) **and** IPv6 (`2606:4700::6812:273`) inside the container.
2. Node 22's built-in `fetch` is backed by **undici**, which by default **prefers IPv6** when both A and AAAA records exist.
3. Docker's default bridge network (`172.18.0.0/16`) has **no IPv6 routing** — outbound traffic to `2606:4700::...` times out at the network level (`ETIMEDOUT`).
4. `wget` and the legacy `https` module are unaffected because they fall back to IPv4 automatically.

### Fix

Added `NODE_OPTIONS=--dns-result-order=ipv4first` in two places (belt-and-suspenders):

| File | Change |
|---|---|
| `Dockerfile` | `ENV NODE_OPTIONS="--dns-result-order=ipv4first"` in Stage 2 (runner) |
| `docker-compose.yml` | `- NODE_OPTIONS=--dns-result-order=ipv4first` in `environment:` block |

The `docker-compose.yml` change takes effect immediately on `docker compose up -d` (no image rebuild needed). The `Dockerfile` change bakes it into future images.

### Verification

```
curl -X POST http://localhost:3000/api/test-connection \
  -H "Content-Type: application/json" \
  -d '{"providerConfig":{"provider":"openrouter","apiKey":"","model":"openrouter/auto"}}'
→ {"success":true,"message":"Connected to openrouter successfully."} ✅
```

---

## 9. Current State (End of Session 2026-08-15)

- **App running at:** http://localhost:3000 (Docker container, healthy)
- **IPv4 fix:** `NODE_OPTIONS=--dns-result-order=ipv4first` in both `Dockerfile` and `docker-compose.yml`
- **Provider:** OpenRouter (`openrouter/auto` model), API key from `.env`
- **Test Connection / Browse Free Models:** Working ✅
