import asyncio
import inspect
import logging
import subprocess
import time
from pathlib import Path
from datetime import datetime
import simpleobsws
from pupil_labs.realtime_api.simple import Device

EXPECTED_PHONE_NAME = "THEIA"
# TRACKER_IP = "10.207.100.236" #IRIS
TRACKER_IP = "10.207.26.42"
TRACKER_PORT = "8080"

OBS_WS_URL = "ws://localhost:4455/"
OBS_WS_PASSWORD = "Lm2SUK7JNbcMWCAI"

LOG_DIR = Path.home() / "Documents" / "experiment_logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(
            LOG_DIR / f"session_{time.strftime('%Y%m%d_%H%M%S')}.log"
        ),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)

state = {
    "device": None,
    "phone_name": None,
    "ip": None,
    "running": False,
}


def find_tracker():
    print(
        f"Connecting to tracker at {TRACKER_IP}:{TRACKER_PORT}...", flush=True)

    try:
        device = Device(address=TRACKER_IP, port=TRACKER_PORT)

        phone_name = getattr(device, "phone_name", None)
        ip = getattr(device, "phone_ip", TRACKER_IP)

        print(f"[CONNECTED] phone={phone_name} | ip={ip}", flush=True)

        return {
            "device": device,
            "phone_name": phone_name,
            "ip": ip,
            "found": [{"phone_name": phone_name, "ip": ip}],
        }

    except Exception as e:
        logger.warning(f"Could not connect to tracker at {TRACKER_IP}: {e}")
        return {
            "device": None,
            "phone_name": None,
            "ip": TRACKER_IP,
            "found": [],
        }


def launch_obs():
    subprocess.Popen(["open", "-a", "OBS"])


async def _obs_request(request_name, request_data=None):
    print("Connecting to OBS...", flush=True)

    params = simpleobsws.IdentificationParameters(
        ignoreNonFatalRequestChecks=False
    )
    ws = simpleobsws.WebSocketClient(
        url=OBS_WS_URL,
        password=OBS_WS_PASSWORD,
        identification_parameters=params,
    )

    await ws.connect()
    await ws.wait_until_identified()
    print("OBS connected", flush=True)

    try:
        request = simpleobsws.Request(request_name, request_data or {})
        response = await ws.call(request)
        print(
            f"[OBS] {request_name} ok={response.ok()} data={response.responseData}",
            flush=True,
        )
        return response.ok(), response.responseData
    finally:
        try:
            await ws.disconnect()
        except Exception:
            pass


def _maybe_await(result):
    if inspect.isawaitable(result):
        return asyncio.run(result)
    return result


def _call_device_method(device, method_name, *args, **kwargs):
    """
    Safely call a tracker device method if it exists.
    Supports sync and async methods.
    """
    method = getattr(device, method_name, None)
    if method is None:
        return {
            "ok": False,
            "message": f"{method_name} not available on device",
        }

    try:
        result = method(*args, **kwargs)
        _maybe_await(result)
        return {
            "ok": True,
            "message": f"{method_name} succeeded",
        }
    except Exception as e:
        return {
            "ok": False,
            "message": f"{method_name} failed: {e}",
        }


def check_tracker():
    result = find_tracker()

    if result["device"] is None:
        return {
            "status": "error",
            "expected_tracker_ip": TRACKER_IP,
            "connected_phone_name": None,
            "tracker_ip": TRACKER_IP,
            "matches_expected_ip": False,
            "found_devices": result["found"],
        }

    try:
        result["device"].close()
    except Exception:
        pass

    return {
        "status": "ok",
        "expected_tracker_ip": TRACKER_IP,
        "connected_phone_name": result["phone_name"],
        "tracker_ip": result["ip"],
        "matches_expected_ip": result["ip"] == TRACKER_IP,
        "found_devices": result["found"],
    }


def connect_tracker():
    if state["device"] is not None:
        return {
            "status": "already_connected",
            "connected_phone_name": state["phone_name"],
            "tracker_ip": state["ip"],
        }

    result = find_tracker()

    if result["device"] is None:
        print(
            f"[CONNECT] tracker not reachable at ip={TRACKER_IP}", flush=True)
        return {
            "status": "error",
            "message": f"Tracker not reachable at {TRACKER_IP}",
            "expected_tracker_ip": TRACKER_IP,
            "found_devices": result["found"],
        }

    state["device"] = result["device"]
    state["phone_name"] = result["phone_name"]
    state["ip"] = result["ip"] or TRACKER_IP

    print(
        f"[CONNECT] connected tracker | phone={state['phone_name']} | ip={state['ip']}",
        flush=True,
    )

    return {
        "status": "connected",
        "connected_phone_name": state["phone_name"],
        "tracker_ip": state["ip"],
    }


def start_tracker_recording():
    if state["device"] is None:
        return {"status": "error", "message": "No connected tracker"}

    try:
        state["device"].recording_start()
        print("[TRACKER] recording_start succeeded", flush=True)

        return {
            "status": "started",
            "connected_phone_name": state["phone_name"],
            "tracker_ip": state["ip"],
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


def stop_tracker_recording():
    if state["device"] is None:
        return {"status": "error", "message": "No connected tracker"}

    try:
        state["device"].recording_stop_and_save()
        print("[TRACKER] recording_stop_and_save succeeded", flush=True)

        return {
            "status": "stopped",
            "connected_phone_name": state["phone_name"],
            "tracker_ip": state["ip"],
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
        }


def start_obs_recording(filename):
    launch_obs()
    time.sleep(5)

    try:
        print(f"[Flask] setting OBS filename: {filename}", flush=True)

        ok, data = asyncio.run(
            _obs_request(
                "SetProfileParameter",
                {
                    "parameterCategory": "Output",
                    "parameterName": "FilenameFormatting",
                    "parameterValue": filename,
                },
            )
        )

        if not ok:
            return {
                "status": "error",
                "message": f"Failed to set OBS filename: {data}",
            }

        ok, data = asyncio.run(_obs_request("StartRecord"))
        if not ok:
            return {
                "status": "error",
                "message": f"OBS failed to start: {data}",
            }

        return {"status": "started", "filename": filename}

    except Exception as e:
        return {"status": "error", "message": str(e)}


def start_all_recordings(filename=None):
    if state["running"]:
        return {
            "status": "already_running",
            "connected_phone_name": state["phone_name"],
            "tracker_ip": state["ip"],
        }

    if state["device"] is None:
        return {"status": "error", "message": "No connected tracker"}

    obs_filename = f"{filename}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    tracker_result = start_tracker_recording()
    if tracker_result["status"] == "error":
        return {
            "status": "error",
            "message": f"Tracker failed to start: {tracker_result['message']}",
        }

    obs_result = start_obs_recording(obs_filename)
    if obs_result["status"] == "error":
        # Best effort rollback
        try:
            stop_tracker_recording()
        except Exception:
            pass
        return obs_result

    state["running"] = True
    return {
        "status": "started",
        "connected_phone_name": state["phone_name"],
        "tracker_ip": state["ip"],
        "obs_filename": obs_filename,
    }


def send_event_marker(name):
    print(
        f"[MARKER] device={state['device'] is not None} | "
        f"phone={state['phone_name']} | "
        f"ip={state['ip']}",
        flush=True,
    )

    if state["device"] is None:
        return {"status": "error", "message": "No active tracker session"}

    if not hasattr(state["device"], "send_event"):
        print(
            f"[MARKER] send_event() not available; skipping {name}", flush=True)
        return {
            "status": "ok",
            "event": name,
            "warning": "send_event not available",
        }

    result = state["device"].send_event(
        name,
        event_timestamp_unix_ns=time.time_ns(),
    )
    _maybe_await(result)

    print(f"[MARKER] sent {name}", flush=True)
    return {"status": "ok", "event": name}


def stop_obs_recording():
    if not state["running"]:
        return {
            "status": "error",
            "message": "OBS recording is not marked as running",
        }

    try:
        print("[OBS] attempting StopRecord", flush=True)
        ok, data = asyncio.run(_obs_request("StopRecord"))
        print(f"[OBS] StopRecord ok={ok} data={data}", flush=True)

        if not ok:
            return {
                "status": "error",
                "message": str(data),
            }

        return {
            "status": "stopped",
            "obs_result": data,
        }

    except Exception as e:
        print(f"[OBS] StopRecord exception: {e}", flush=True)
        return {
            "status": "error",
            "message": str(e),
        }


def stop_script():
    tracker_stop_result = None

    if state["running"]:
        try:
            ok, data = asyncio.run(_obs_request("StopRecord"))
            if not ok:
                logger.warning(f"OBS stop failed: {data}")
        except Exception as e:
            logger.warning(f"OBS stop request failed: {e}")

        time.sleep(5)

        try:
            tracker_stop_result = stop_tracker_recording()
        except Exception as e:
            logger.warning(f"Tracker stop failed: {e}")

    result = {
        "status": "stopped",
        "connected_phone_name": state["phone_name"],
        "tracker_ip": state["ip"],
        "tracker_stop_result": tracker_stop_result,
    }

    state["device"] = None
    state["phone_name"] = None
    state["ip"] = None
    state["running"] = False

    return result
