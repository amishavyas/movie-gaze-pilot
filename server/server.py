from flask import Flask, jsonify, request
from flask_cors import CORS
from recording import (
    connect_tracker,
    start_all_recordings,
    stop_script,
    send_event_marker,
    check_tracker,
)
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)


def run_action(action, label):
    try:
        result = action()
        print(f"{label}: {result}", flush=True)
        return jsonify(result)
    except Exception as e:
        print(f"Error in {label}: {e}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/check_tracker", methods=["GET"])
def check_tracker_route():
    return run_action(check_tracker, "check_tracker")


@app.route("/connect_tracker", methods=["POST"])
def connect_tracker_route():
    return run_action(connect_tracker, "connect_tracker")


@app.route("/start_recordings", methods=["POST"])
def start_recordings():
    data = request.get_json(silent=True) or {}
    print(data)
    filename = data.get("filename")
    print(f"[Flask] received filename={filename}", flush=True)
    return run_action(lambda: start_all_recordings(filename), "start_recordings")


@app.route("/start_video_event", methods=["POST"])
def start_video_event():
    data = request.get_json(silent=True) or {}
    print("video.start", data, flush=True)
    return run_action(lambda: send_event_marker("video.start"), "start_video_event")


@app.route("/end_video_event", methods=["POST"])
def end_video_event():
    data = request.get_json(silent=True) or {}
    print("video.end", data, flush=True)
    return run_action(lambda: send_event_marker("video.end"), "end_video_event")


@app.route("/stop_recordings", methods=["POST"])
def stop_recordings():
    return run_action(stop_script, "stop_recordings")


if __name__ == "__main__":
    app.run(debug=True, port=5001)
