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


#def async_worker():
    #while True:
        #with app.app_context():
            #transfer_utterance_data()

# Below code adds random data to session_output.csv for testing purposes
def add_rows():
    while True:
        # Add a random number (1,10) of fake rows to session_output.csv every 2 seconds
        #add_rows_to_csv(random.randint(1, 10))
        print("this is working")
        time.sleep(30)


#threading.Thread(target=async_worker).start()
#threading.Thread(target=add_rows).start()


if __name__ == "__main__":
    app.run(port=8000, debug=True)
