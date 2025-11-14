from flask import Flask, jsonify
import threading
import time
from recording import execute_script
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

recording_thread = None
stop_flag = False


def run_recording():
    global stop_flag
    try:
        result = execute_script(stop_flag_callback=lambda: stop_flag)
        print("Recording thread finished:", result)
    except Exception as e:
        print(f"Error in recording thread: {e}")


@app.route("/start_recordings", methods=["GET"])
def start_recordings():
    global recording_thread, stop_flag
    if recording_thread and recording_thread.is_alive():
        return jsonify({"status": "already_running"})

    stop_flag = False
    recording_thread = threading.Thread(target=run_recording, daemon=True)
    recording_thread.start()
    print("Recording started.")
    return jsonify({"status": "started"})


@app.route("/stop_recordings", methods=["GET"])
def stop_recordings():
    global stop_flag, recording_thread
    if not recording_thread:
        return jsonify({"status": "no_active_recording"})

    stop_flag = True
    print("Stop signal sent to recording thread.")

    # Optionally wait for thread to finish (non-blocking preferred)
    def join_thread():
        if recording_thread.is_alive():
            recording_thread.join(timeout=5)
    threading.Thread(target=join_thread, daemon=True).start()

    return jsonify({"status": "stopped"})


if __name__ == "__main__":
    app.run(debug=True)
