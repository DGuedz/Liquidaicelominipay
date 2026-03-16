#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_PID_FILE="$ROOT_DIR/.liquidai-api.pid"
WEB_PID_FILE="$ROOT_DIR/.liquidai-web.pid"
API_LOG_FILE="$ROOT_DIR/.liquidai-api.log"
WEB_LOG_FILE="$ROOT_DIR/.liquidai-web.log"
API_PORT=8787
WEB_PORT=5173

is_pid_running() {
  pid="$1"
  if [ -z "$pid" ]; then
    return 1
  fi
  kill -0 "$pid" 2>/dev/null
}

pid_from_file() {
  pid_file="$1"
  if [ ! -f "$pid_file" ]; then
    echo ""
    return
  fi
  cat "$pid_file" 2>/dev/null || echo ""
}

port_has_listener() {
  port="$1"
  lsof -i "tcp:$port" -sTCP:LISTEN >/dev/null 2>&1
}

cleanup() {
  if [ -f "$API_PID_FILE" ]; then
    kill "$(cat "$API_PID_FILE")" 2>/dev/null || true
    rm -f "$API_PID_FILE"
  fi
  if [ -f "$WEB_PID_FILE" ]; then
    kill "$(cat "$WEB_PID_FILE")" 2>/dev/null || true
    rm -f "$WEB_PID_FILE"
  fi
}

API_PID="$(pid_from_file "$API_PID_FILE")"
WEB_PID="$(pid_from_file "$WEB_PID_FILE")"

if [ -n "$API_PID" ] && [ -n "$WEB_PID" ] && is_pid_running "$API_PID" && is_pid_running "$WEB_PID"; then
  echo "Preview stack ja esta rodando."
  echo "  Frontend: http://localhost:${WEB_PORT}"
  echo "  Backend:  http://localhost:${API_PORT}/api/health"
  exit 0
fi

if [ -f "$API_PID_FILE" ] || [ -f "$WEB_PID_FILE" ]; then
  echo "Limpando PID files orfaos..."
  rm -f "$API_PID_FILE" "$WEB_PID_FILE"
fi

if port_has_listener "$API_PORT" || port_has_listener "$WEB_PORT"; then
  echo "Porta ${API_PORT} ou ${WEB_PORT} ja esta em uso por outro processo."
  echo "Execute: pnpm preview:stack:stop"
  exit 1
fi

echo "Iniciando backend em http://localhost:8787 ..."
cd "$ROOT_DIR"
pnpm api:start >"$API_LOG_FILE" 2>&1 &
echo "$!" >"$API_PID_FILE"

echo "Iniciando frontend em http://localhost:5173 ..."
pnpm dev --host 0.0.0.0 --port 5173 >"$WEB_LOG_FILE" 2>&1 &
echo "$!" >"$WEB_PID_FILE"

trap cleanup INT TERM EXIT

sleep 2
echo "Preview ativo:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8787/api/health"
echo "Logs:"
echo "  $WEB_LOG_FILE"
echo "  $API_LOG_FILE"
echo
echo "Pressione Ctrl+C para encerrar ambos os processos."

wait "$(cat "$API_PID_FILE")" "$(cat "$WEB_PID_FILE")"
