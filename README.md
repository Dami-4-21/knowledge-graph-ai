# Knowledge Graph AI

An AI-powered personal knowledge graph that extracts concepts, relationships, and learning paths from your notes.

## Architecture

```
Browser (React + Vite)
    ↓
Express Backend (server.ts)
    ↓ OpenRouter env key injected server-side
OpenRouter API → Selected AI Model
```

---

## Quick Start

### 1. Configure your API Key

```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

Get your key at: https://openrouter.ai/keys

### 2. Start with Docker

```bash
docker compose up -d
```

Then open: http://localhost:3000

### 3. Stop

```bash
docker compose stop       # preserves data
# or:
docker compose down       # stops and removes containers (data in volumes is preserved)
# WARNING — to also delete data:
docker compose down -v
```

---

## Linux Desktop Launcher

A one-click launcher is installed at:

```
~/.local/share/applications/knowledge-graph-ai.desktop
```

**Click it from your application menu** to:
1. Detect Docker (shows error if not found)
2. Start Docker daemon if needed
3. Start the application containers
4. Wait for the health check to pass (no arbitrary sleep)
5. Open http://localhost:3000 in your browser

Launch logs: `/tmp/kg-ai-launch.log`

### Manual launch

```bash
./scripts/launch.sh
```

### Stop

```bash
./scripts/stop.sh
```

---

## AI Configuration

### Using OpenRouter (Recommended)

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
```

**The API key is loaded server-side only — never exposed to the browser.**

When OpenRouter is selected in the Settings UI and the key field is left empty, the server automatically uses `OPENROUTER_API_KEY` from `.env`.

### Changing the Model

Simply update `OPENROUTER_MODEL` in `.env` and restart:

```bash
# Example free models (browse current list in Settings → AI Provider → Browse Free Models)
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
OPENROUTER_MODEL=google/gemma-3-27b-it:free
OPENROUTER_MODEL=deepseek/deepseek-r1:free
OPENROUTER_MODEL=mistralai/mistral-7b-instruct:free
```

Browse live free models: https://openrouter.ai/models?q=:free

Or use the **Browse Free OpenRouter Models** button in Settings → AI Provider (when OpenRouter is selected).

### Using Other Providers

Open Settings (⚙ icon in the toolbar), select your provider, enter your API key, and click **Save Provider Settings**. Supported: OpenAI, Anthropic, Groq, Together, NVIDIA NIM, Mistral, Ollama, LM Studio, and Custom OpenAI-compatible endpoints.

---

## Health Check

The server exposes a health endpoint:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","provider":"openrouter","model":"meta-llama/llama-3.1-8b-instruct:free","keyConfigured":true,"timestamp":"..."}
```

---

## Development (without Docker)

```bash
# Install Node.js 22+ (via nvm)
export NVM_DIR="$HOME/.config/nvm" && source "$NVM_DIR/nvm.sh"
nvm install 22 && nvm use 22

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open: http://localhost:3000

---

## Troubleshooting

| Problem | Solution |
|---|---|
| **Docker not running** | `sudo systemctl start docker` or `sudo service docker start` |
| **Permission denied (Docker)** | Add yourself to the docker group: `sudo usermod -aG docker $USER` then log out/in |
| **OpenRouter auth failure (401)** | Check `OPENROUTER_API_KEY` in `.env` — get a new key at openrouter.ai/keys |
| **Model not found (404)** | The model in `OPENROUTER_MODEL` may no longer exist. Browse free models in Settings |
| **Rate limit (429)** | Free models have strict limits. Wait a moment or switch to another free model |
| **Insufficient credits (402)** | Add credits at openrouter.ai/credits, or switch to a free (`:free`) model |
| **Context window exceeded** | Use a model with a larger context window |
| **Container startup failure** | `docker compose logs` to see details |
| **Health check timeout** | Container may still be building. Check: `docker compose ps` |
| **App not in launcher** | Run: `update-desktop-database ~/.local/share/applications/` |
| **Blank graph** | Click **Discover** in the toolbar to trigger an AI scan |

---

## File Structure

```
knowledge-graph-ai/
├── src/
│   ├── services/ai/
│   │   ├── OpenRouterProvider.ts   # OpenRouter client (env-key backed)
│   │   └── AIService.ts            # AI orchestration layer
│   ├── components/                 # React UI components
│   ├── context/                    # App state (React context)
│   └── types.ts                   # TypeScript types
├── server.ts                      # Express backend
├── Dockerfile                     # Multi-stage Docker build
├── docker-compose.yml             # Service definition
├── .env.example                   # Config template (commit this)
├── .env                           # Your secrets (NEVER commit)
├── scripts/
│   ├── launch.sh                  # One-click startup script
│   └── stop.sh                    # Graceful stop script
└── ~/.local/share/applications/
    └── knowledge-graph-ai.desktop # Linux app launcher
```
