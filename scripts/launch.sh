#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# launch.sh — Knowledge Graph AI one-click launcher
#
# Workflow:
#   1. Verify Docker is installed and the daemon is running
#   2. Start the application containers (docker compose up -d)
#   3. Poll /api/health until the app responds (no arbitrary sleep)
#   4. Open the browser at http://localhost:3000
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_URL="http://localhost:3000"
HEALTH_URL="${APP_URL}/api/health"
MAX_WAIT_SECONDS=120
POLL_INTERVAL=2

# ── Helpers ───────────────────────────────────────────────────────────────────
log()  { echo "[KG-AI] $*"; }
warn() { echo "[KG-AI] ⚠  $*" >&2; }
die()  {
  local msg="$*"
  echo "[KG-AI] ✗ ${msg}" >&2

  # Try to show a desktop notification if available
  if command -v notify-send &>/dev/null; then
    notify-send --urgency=critical "Knowledge Graph AI" "${msg}" 2>/dev/null || true
  elif command -v zenity &>/dev/null; then
    zenity --error --title="Knowledge Graph AI" --text="${msg}" 2>/dev/null || true
  fi

  exit 1
}

# ── Step 1: Check Docker is installed ────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  die "Docker is not installed or not in PATH.
Please install Docker: https://docs.docker.com/get-docker/
Then re-run this launcher."
fi

# ── Step 2: Check Docker daemon is running ────────────────────────────────────
if ! docker info &>/dev/null 2>&1; then
  log "Docker daemon is not running. Attempting to start it..."

  # Try systemctl first (most Linux distros)
  if command -v systemctl &>/dev/null; then
    if sudo systemctl start docker 2>/dev/null; then
      log "Docker daemon started via systemctl."
      sleep 2
    else
      die "Could not start Docker daemon via systemctl.
Try running: sudo systemctl start docker
Then re-run this launcher."
    fi
  # Try service command (Debian/Ubuntu fallback)
  elif command -v service &>/dev/null; then
    if sudo service docker start 2>/dev/null; then
      log "Docker daemon started via service."
      sleep 2
    else
      die "Could not start Docker daemon.
Try running: sudo service docker start
Then re-run this launcher."
    fi
  else
    die "Docker daemon is not running and could not be started automatically.
Please start Docker and re-run this launcher."
  fi

  # Re-check after start attempt
  if ! docker info &>/dev/null 2>&1; then
    die "Docker daemon failed to start. Check Docker installation."
  fi
fi

log "Docker is running."

# ── Step 3: Check docker compose is available ─────────────────────────────────
if ! docker compose version &>/dev/null 2>&1; then
  if ! command -v docker-compose &>/dev/null; then
    die "docker compose (V2) or docker-compose (V1) is not available.
Please install Docker Compose: https://docs.docker.com/compose/install/"
  fi
  # Fall back to V1
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD="docker compose"
fi

# ── Step 4: Start containers ──────────────────────────────────────────────────
log "Starting Knowledge Graph AI containers..."
cd "${APP_DIR}"

if ! $COMPOSE_CMD up -d --build 2>&1; then
  die "Failed to start containers. Check docker compose logs for details:
  cd ${APP_DIR} && ${COMPOSE_CMD} logs"
fi

log "Containers started. Waiting for the application to be ready..."

# ── Step 5: Health check loop ─────────────────────────────────────────────────
elapsed=0
while true; do
  if curl -sf "${HEALTH_URL}" -o /dev/null 2>/dev/null; then
    log "Application is ready! ✓"
    break
  fi

  if (( elapsed >= MAX_WAIT_SECONDS )); then
    warn "Application did not become ready within ${MAX_WAIT_SECONDS}s."
    warn "Container logs:"
    $COMPOSE_CMD logs --tail=30 2>/dev/null || true
    die "Health check timed out after ${MAX_WAIT_SECONDS}s.
Check logs: cd ${APP_DIR} && ${COMPOSE_CMD} logs"
  fi

  sleep "${POLL_INTERVAL}"
  (( elapsed += POLL_INTERVAL )) || true
  log "  Waiting... (${elapsed}s / ${MAX_WAIT_SECONDS}s)"
done

# ── Step 6: Open browser ──────────────────────────────────────────────────────
log "Opening ${APP_URL} in your default browser..."
if command -v xdg-open &>/dev/null; then
  xdg-open "${APP_URL}" &
elif command -v x-www-browser &>/dev/null; then
  x-www-browser "${APP_URL}" &
elif command -v firefox &>/dev/null; then
  firefox "${APP_URL}" &
elif command -v chromium-browser &>/dev/null; then
  chromium-browser "${APP_URL}" &
elif command -v google-chrome &>/dev/null; then
  google-chrome "${APP_URL}" &
else
  log "Could not detect a browser. Please open ${APP_URL} manually."
fi

log "Knowledge Graph AI is running at ${APP_URL}"
