from flask import Flask, jsonify, request
from flask_cors import CORS
from recording import connect_tracker, start_obs_recording, stop_script, send_event_marker, check_tracker

app = Flask(__name__)
CORS(app)


@app.route("/check_tracker", methods=["GET"])
def check_tracker_route():
    try:
        result = check_tracker()
        print("check_tracker:", result, flush=True)
        return jsonify(result)
    except Exception as e:
        print(f"Error checking tracker: {e}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/connect_tracker", methods=["POST"])
def connect_tracker_route():
    try:
        result = connect_tracker()
        print("connect_tracker:", result, flush=True)
        return jsonify(result)
    except Exception as e:
        print(f"Error connecting tracker: {e}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/start_recordings", methods=["POST"])
def start_recordings():
    try:
        result = start_obs_recording()
        print("start_recordings:", result, flush=True)
        return jsonify(result)
    except Exception as e:
        print(f"Error starting recordings: {e}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/start_video_event", methods=["POST"])
def start_video_event():
    data = request.get_json(silent=True) or {}
    print("video.start", data, flush=True)

    try:
        result = send_event_marker("video.start")
        print("start_video_event:", result, flush=True)
        return jsonify(result)
    except Exception as e:
        print(f"Error sending video.start marker: {e}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/end_video_event", methods=["POST"])
def end_video_event():
    data = request.get_json(silent=True) or {}
    print("video.end", data, flush=True)

    try:
        result = send_event_marker("video.end")
        print("end_video_event:", result, flush=True)
        return jsonify(result)
    except Exception as e:
        print(f"Error sending video.end marker: {e}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/stop_recordings", methods=["POST"])
def stop_recordings():
    try:
        result = stop_script()
        print("stop_recordings:", result, flush=True)
        return jsonify(result)
    except Exception as e:
        print(f"Error stopping recordings: {e}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5001)
