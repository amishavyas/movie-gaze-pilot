#!/bin/bash
set -e

# Start Flask server 
echo "Starting Flask server..."
cd server || exit 1

VENV_PATH="dev_env"

# Create virtual environment if it doesn't exist 
if [ ! -d "$VENV_PATH" ]; then
  echo "⚙️  Creating virtual environment..."
  python3 -m venv "$VENV_PATH"
fi

# Activate venv for package installs
source "$VENV_PATH/bin/activate"

# Check if Flask and numpy are installed
echo "📦 Checking Python dependencies..."
pip install --quiet --upgrade pip
pip install --quiet flask numpy


export FLASK_APP=server.py
export FLASK_ENV=development

# Run Flask using the specified environment
echo "🚀 Launching Flask on port 5000..."
"$VENV_PATH/bin/python" -m flask run --reload --host=0.0.0.0 --port=5000 2>&1 | sed 's/^/[Flask] /' &
FLASK_PID=$!

cd ..

# Start React  
echo "Starting React client..."
cd client || exit 1
(BROWSER=none npm start 2>&1 | sed 's/^/[React] /') &
REACT_PID=$!

sleep 5
echo "🌐 Opening browser at http://localhost:3000"
if command -v open &> /dev/null; then
    open http://localhost:3000
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
else
    echo "Please open http://localhost:3000 manually."
fi

# Clean up 
trap "echo '🛑 Stopping servers...'; kill $FLASK_PID $REACT_PID" SIGINT

echo "Flask PID: $FLASK_PID | React PID: $REACT_PID"
echo "✅ Both servers running — Flask on :5000, React on :3000"
echo "Press Ctrl+C to stop."

# Wait for processes to finish 
wait
