#!/bin/bash
set -e

# --- Start Flask server ---
echo "Starting Flask server..."
cd server

# Check for virtual environment
if [ ! -d "dev_env" ]; then
  echo "❌ Virtual environment 'dev_env' not found!"; exit 1
fi

# Activate the virtual environment
source dev_env/bin/activate

# Tell Flask what to run
export FLASK_APP=server.py          # change if your main file is different
export FLASK_ENV=development     # enables debug mode + reloader

# Run Flask and prefix logs
(flask run --reload --port=5000 2>&1 | sed 's/^/[Flask] /') &
FLASK_PID=$!

# Return to project root
cd ..

# --- Start React client ---
echo "Starting React client..."
cd client

# Prevent React from auto-opening a browser
(BROWSER=none npm start 2>&1 | sed 's/^/[React] /') &
REACT_PID=$!

# --- Wait a few seconds and open browser ---
sleep 6
echo "🌐 Opening browser at http://localhost:3000"
# For macOS use 'open', for Linux use 'xdg-open'
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
else
    echo "Please open http://localhost:3000 manually."
fi

# --- Handle shutdown ---
trap "echo 'Stopping...'; kill $FLASK_PID $REACT_PID" SIGINT

echo "Flask PID: $FLASK_PID | React PID: $REACT_PID"
echo "🚀 Both servers running — Flask on :5000, React on :3000"
echo "Press Ctrl+C to stop."

# --- Wait for both processes ---
wait
