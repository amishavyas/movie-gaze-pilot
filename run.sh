#!/bin/bash
set -e

# ==========================================================
#  Launch Flask backend and React frontend (Chrome kiosk)
# ==========================================================

echo "[INFO] Starting Flask backend..."
cd server || exit 1

VENV_PATH="dev_env"

# Create Python virtual environment if missing
if [ ! -d "$VENV_PATH" ]; then
  echo "[INFO] Creating Python virtual environment..."
  python3 -m venv "$VENV_PATH"
fi

# Activate environment and install required packages
source "$VENV_PATH/bin/activate"
pip install --quiet --upgrade pip
pip install --quiet flask numpy

export FLASK_APP=server.py
export FLASK_ENV=production

# Run Flask server
"$VENV_PATH/bin/python" -m flask run --host=0.0.0.0 --port=5000 2>&1 | sed 's/^/[Flask] /' &
FLASK_PID=$!

cd ..

# ==========================================================
#  Start React frontend
# ==========================================================
echo "[INFO] Starting React frontend..."
cd client || exit 1
(BROWSER=none npm start 2>&1 | sed 's/^/[React] /') &
REACT_PID=$!

sleep 5  # allow servers to fully boot

# ==========================================================
#  Chrome Kiosk Setup
# ==========================================================
APP_URL="http://localhost:3000"
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TEMP_PROFILE_DIR="/tmp/chrome_experiment_profile"

echo
read -p "Launch Chrome in fullscreen kiosk mode? (y/n): " USE_KIOSK

if [[ "$USE_KIOSK" =~ ^[Yy]$ ]]; then
  echo "[INFO] Launching Chrome in fullscreen kiosk mode..."
  rm -rf "$TEMP_PROFILE_DIR"
  mkdir -p "$TEMP_PROFILE_DIR"

  if [ -x "$CHROME_PATH" ]; then
    # --- Chrome flags for true fullscreen on macOS ---
    "$CHROME_PATH" \
      --user-data-dir="$TEMP_PROFILE_DIR" \
      --no-first-run \
      --no-default-browser-check \
      --app="$APP_URL" \
      --kiosk \
      --start-fullscreen \
      --window-position=0,0 \
      --window-size=$(osascript -e 'tell app "Finder" to get bounds of window of desktop' | awk -F', ' '{print $3 - $1","$4 - $2}') \
      --enable-features=OverlayScrollbar,FullScreenAppList,InAppKioskMode \
      --disable-features=TranslateUI,Infobars,HardwareMediaKeyHandling \
      --noerrdialogs \
      --disable-sync \
      --disable-component-update \
      --disable-background-networking \
      --disable-domain-reliability \
      --disable-default-apps \
      --disable-session-crashed-bubble \
      --autoplay-policy=no-user-gesture-required \
      --check-for-update-interval=31536000 \
      --log-level=3 \
      --vmodule=*=-99 \
      --no-first-run \
      --no-startup-window &
  else
    echo "[WARN] Chrome not found at $CHROME_PATH. Please open $APP_URL manually."
  fi
else
  echo "[INFO] Opening $APP_URL in regular browser..."
  if command -v open &> /dev/null; then
    open "$APP_URL"
  else
    echo "[WARN] Please open $APP_URL manually."
  fi
fi

# ==========================================================
#  Graceful shutdown on Ctrl+C
# ==========================================================
trap "echo; echo '[INFO] Stopping Flask and React servers...'; kill $FLASK_PID $REACT_PID" SIGINT

echo
echo "[INFO] Flask PID: $FLASK_PID | React PID: $REACT_PID"
echo "[INFO] Servers running — Flask on :5000, React on :3000"
echo "[INFO] Press Ctrl+C to stop."

wait
