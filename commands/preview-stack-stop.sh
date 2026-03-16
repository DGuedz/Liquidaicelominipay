#!/bin/sh
set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_PID_FILE="$ROOT_DIR/.liquidai-api.pid"
WEB_PID_FILE="$ROOT_DIR/.liquidai-web.pid"
API_PORT=8787
WEB_PORT=5173

stop_pid_file() {
  pid_file="$1"
  if [ ! -f "$pid_file" ]; then
    return
  fi
  pid="$(cat "$pid_file")"
  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null || true
  fi
  rm -f "$pid_file"
}

stop_pid_file "$API_PID_FILE"
stop_pid_file "$WEB_PID_FILE"

# Fallback: if processes were started without pid files, free known ports.
if lsof -ti "tcp:${API_PORT}" >/dev/null 2>&1; then
  kill $(lsof -ti "tcp:${API_PORT}") 2>/dev/null || true
fi
if lsof -ti "tcp:${WEB_PORT}" >/dev/null 2>&1; then
  kill $(lsof -ti "tcp:${WEB_PORT}") 2>/dev/null || true
fi

echo "Preview stack encerrado."
