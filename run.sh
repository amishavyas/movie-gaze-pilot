#!/bin/bash
set -e

# Kill anything already on the ports
lsof -ti :5001 | xargs kill -9 2>/dev/null || true
lsof -ti :3000 | xargs kill -9 2>/dev/null || true

echo "[INFO] Starting Flask backend..."
cd server || exit 1

VENV_PATH="dev_env"

if [ ! -d "$VENV_PATH" ]; then
  echo "[INFO] Creating Python virtual environment..."
  python3 -m venv "$VENV_PATH"
fi

"$VENV_PATH/bin/python" -m pip install --quiet --upgrade pip

if [ -f "requirements.txt" ]; then
  echo "[INFO] Installing Python packages from requirements.txt..."
  "$VENV_PATH/bin/python" -m pip install --quiet -r requirements.txt
fi

"$VENV_PATH/bin/python" -m flask --app server.py run --host=0.0.0.0 --port=5001 2>&1 | sed 's/^/[Flask] /' &
FLASK_PID=$!

cd .. || exit 1

echo "[INFO] Starting React frontend..."
cd client || exit 1

if [ ! -d "node_modules" ]; then
  echo "[INFO] Installing React packages..."
  if [ -f "package-lock.json" ]; then
    npm ci
  else
    npm install
  fi
else
  echo "[INFO] React packages already installed."
fi

(BROWSER=none npm start 2>&1 | sed 's/^/[React] /') &
REACT_PID=$!

cd .. || exit 1

cleanup() {
  echo
  echo "[INFO] Stopping Flask and React servers..."
  kill "$FLASK_PID" "$REACT_PID" 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM

echo
echo "[INFO] Flask PID: $FLASK_PID | React PID: $REACT_PID"
echo "[INFO] Servers running — Flask on :5001, React on :3000"
echo "[INFO] Press Ctrl+C to stop."

wait