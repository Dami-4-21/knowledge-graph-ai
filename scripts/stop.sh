#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# stop.sh — Knowledge Graph AI graceful stop
#
# Stops containers WITHOUT deleting persistent data (volumes).
# To fully remove everything including data, use: docker compose down -v
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log()  { echo "[KG-AI] $*"; }
die()  { echo "[KG-AI] ✗ $*" >&2; exit 1; }

if ! command -v docker &>/dev/null; then
  die "Docker is not installed or not in PATH."
fi

if docker compose version &>/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE_CMD="docker-compose"
else
  die "docker compose is not available."
fi

cd "${APP_DIR}"

log "Stopping Knowledge Graph AI containers (data is preserved)..."
$COMPOSE_CMD stop

log "Containers stopped. Your data is safe in Docker volumes."
log "To restart: run the launcher or: ${COMPOSE_CMD} start"
log "To fully remove (WARNING — deletes data): ${COMPOSE_CMD} down -v"
