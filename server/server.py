from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from recording import (
    connect_tracker,
    start_all_recordings,
    stop_script,
    send_event_marker,
    check_tracker,
    start_tracker_recording,
    stop_tracker_recording,
    stop_obs_recording
)
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)


def run_action(action, label):
    try:
        result = action()
        print(f"{label}: {result}", flush=True)

        if isinstance(result, Response):
            return result

        if isinstance(result, dict) and result.get("status") == "error":
            return jsonify(result), 500

        return jsonify(result), 200

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


@app.route("/send_event_marker", methods=["POST"])
def handle_send_event_marker():
    data = request.get_json(silent=True) or {}
    event = data.get("event", "unknown.event")
    print(event, data, flush=True)
    return run_action(lambda: send_event_marker(event), "send_event_marker")

@app.route("/start_video_event", methods=["POST"])
def start_video_event():
    data = request.get_json(silent=True) or {}
    print("video.start", data, flush=True)
    return run_action(lambda: send_event_marker("start.video"), "start_video_event")


@app.route("/end_video_event", methods=["POST"])
def end_video_event():
    data = request.get_json(silent=True) or {}
    print("video.end", data, flush=True)
    return run_action(lambda: send_event_marker("end.video"), "end_video_event")


@app.route("/stop_recordings", methods=["POST"])
def stop_recordings():
    return run_action(stop_script, "stop_recordings")


@app.route("/start_tracker_recording", methods=["POST"])
def start_tracker_recording_route():
    return run_action(start_tracker_recording, "start_tracker_recording")


@app.route("/stop_tracker_recording", methods=["POST"])
def stop_tracker_recording_route():
    return run_action(stop_tracker_recording, "stop_tracker_recording")


@app.route("/stop_obs_recording", methods=["POST"])
def stop_obs_recording_route():
    return run_action(stop_obs_recording, "stop_obs_recording")

if __name__ == "__main__":
    app.run(debug=True, port=5001)
