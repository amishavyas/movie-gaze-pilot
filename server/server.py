from flask import Flask, request, jsonify, g
import time
import datetime
import threading
import csv
import random
import os
from recording import execute_script
from flask_cors import CORS

# source dev_env/bin/activate
# flask --app server --debug run

app = Flask(__name__)
CORS(app)


@app.route("/start_recordings", methods=["GET"])
def start_eyetracker_screen_recordings():
    def run_recording():
        try:
            result = execute_script()
            print(result)
        except Exception as e:
            print(f"Error: {e}")

    threading.Thread(target=run_recording).start()
    return jsonify({"status": "started"})


# add random data to session_output.csv for testing purposes
def add_rows():
    while True:
        print("this is working")
        time.sleep(30)


if __name__ == "__main__":
    app.run(debug=True)
