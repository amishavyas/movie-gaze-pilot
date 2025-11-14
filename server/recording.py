"""
recording.py — Controls eyetracker and OBS screen recording synchronization.

Workflow:
1. Start eyetracker first.
2. Then start OBS + video playback simultaneously.
3. Ensure OBS runs slightly longer than the video.
4. Record start and end events aligned to eyetracker time.
"""

import asyncio
import logging
import os
import platform
import time
import subprocess
import numpy as np
import simpleobsws
from pathlib import Path

from pupil_labs.realtime_api import Device, Network, StatusUpdateNotifier
from pupil_labs.realtime_api.models import Recording
from pupil_labs.realtime_api.time_echo import TimeOffsetEstimator
from rich.logging import RichHandler


# ---------------------------------------------------------------------
# Logging configuration (console + file)
# ---------------------------------------------------------------------
DOCS_LOG_DIR = Path.home() / "Documents" / "experiment_logs"
DOCS_LOG_DIR.mkdir(parents=True, exist_ok=True)
timestamp = time.strftime("%Y%m%d_%H%M%S")
LOG_PATH = DOCS_LOG_DIR / f"session_{timestamp}.log"

logging.basicConfig(
    format="%(message)s",
    level=logging.INFO,
    datefmt="[%X]",
    handlers=[RichHandler()],
)
logger = logging.getLogger(__name__)

file_handler = logging.FileHandler(LOG_PATH)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(
    logging.Formatter(
        "%(asctime)s — %(levelname)s — %(message)s", "%Y-%m-%d %H:%M:%S")
)
logger.addHandler(file_handler)
logger.info(f"Session logs will be saved to: {LOG_PATH}")


# ---------------------------------------------------------------------
# Helper callback
# ---------------------------------------------------------------------
async def _log_recording_update(component):
    if isinstance(component, Recording):
        logger.info(f"Recording update: {component.message}")


# ---------------------------------------------------------------------
# Start eyetracker + OBS recording
# ---------------------------------------------------------------------
async def main():
    """Start eyetracker first, then OBS recording and video playback."""

    # Discover device
    async with Network() as network:
        device_info = await network.wait_for_new_device(timeout_seconds=5)

    if device_info is None:
        logger.error("No Pupil Labs device detected.")
        return {"status": "error", "message": "No device found"}

    async with Device.from_discovered_device(device_info) as device:
        status = await device.get_status()
        logger.info(f"Connected to eyetracker at {status.phone.ip}")
        logger.info(
            f"Battery: {status.phone.battery_level}% | Glasses SN: {status.hardware.glasses_serial}")

        # Estimate offset between host and eyetracker clocks
        offset_estimator = TimeOffsetEstimator(
            status.phone.ip, status.phone.time_echo_port)
        offset_result = await offset_estimator.estimate()
        offset_ns = offset_result.time_offset_ms.mean * 1e6
        logger.info(
            f"Estimated time offset: {offset_result.time_offset_ms.mean:.3f} ms")

        # Start eyetracker recording first
        notifier = StatusUpdateNotifier(
            device, callbacks=[_log_recording_update])
        await notifier.receive_updates_start()
        recording_id = await device.recording_start()
        logger.info(f"Eyetracker recording started (ID: {recording_id})")

        # Allow eyetracker to stabilize before OBS/video
        await asyncio.sleep(2)

        # Launch OBS
        try:
            if platform.system() == "Windows":
                obs_command = ["start", "OBS.exe"]
            elif platform.system() == "Darwin":
                obs_command = ["open", "-a", "OBS.app"]
            else:
                obs_command = ["obs"]

            logger.info(f"Launching OBS: {' '.join(obs_command)}")
            subprocess.Popen(" ".join(obs_command), shell=True)
        except Exception as e:
            logger.error(f"Unable to launch OBS: {e}")
            return {"status": "error", "message": str(e)}

        await asyncio.sleep(5)  # allow OBS to initialize

        # Connect to OBS websocket
        parameters = simpleobsws.IdentificationParameters(
            ignoreNonFatalRequestChecks=False)
        ws = simpleobsws.WebSocketClient(
            url="ws://localhost:4455/",
            password="theiaeyetracker",
            identification_parameters=parameters,
        )

        try:
            await ws.connect()
            await ws.wait_until_identified()
            logger.info("Connected to OBS WebSocket")

            # Start OBS recording
            before = time.time_ns()
            response = await ws.call(simpleobsws.Request("StartRecord"))
            after = time.time_ns()

            if response.ok():
                logger.info("OBS recording started.")
                await device.send_event(
                    "start.video",
                    event_timestamp_unix_ns=np.mean(
                        [before, after]) - offset_ns,
                )
            else:
                logger.warning(
                    f"OBS failed to start recording: {response.responseData}")

            logger.info("Recording in progress...")
            return {"status": "started", "recording_id": recording_id}

        except Exception as e:
            logger.error(f"OBS connection error: {e}")
            return {"status": "error", "message": str(e)}

        finally:
            try:
                await ws.disconnect()
                logger.info("Disconnected from OBS WebSocket.")
            except Exception:
                pass


# ---------------------------------------------------------------------
# Stop both OBS and eyetracker recordings
# ---------------------------------------------------------------------
async def stop_recording():
    """Stop OBS recording after short buffer, then end eyetracker session."""

    try:
        # Reconnect to device
        async with Network() as network:
            device_info = await network.wait_for_new_device(timeout_seconds=5)
        if device_info is None:
            logger.error("No device detected during stop phase.")
            return {"status": "error", "message": "No device found"}

        async with Device.from_discovered_device(device_info) as device:
            status = await device.get_status()
            offset_estimator = TimeOffsetEstimator(
                status.phone.ip, status.phone.time_echo_port)
            offset_result = await offset_estimator.estimate()
            offset_ns = offset_result.time_offset_ms.mean * 1e6

            # Connect to OBS
            parameters = simpleobsws.IdentificationParameters(
                ignoreNonFatalRequestChecks=False)
            ws = simpleobsws.WebSocketClient(
                url="ws://localhost:4455/",
                password="theiaeyetracker",
                identification_parameters=parameters,
            )

            await ws.connect()
            await ws.wait_until_identified()

            # Wait 2s after video ends to ensure full capture
            await asyncio.sleep(2)

            before = time.time_ns()
            response = await ws.call(simpleobsws.Request("StopRecord"))
            after = time.time_ns()

            if response.ok():
                logger.info("OBS recording stopped.")
                await device.send_event(
                    "end.video",
                    event_timestamp_unix_ns=np.mean(
                        [before, after]) - offset_ns,
                )
                await device.recording_stop()
                logger.info("Eyetracker recording stopped.")
            else:
                logger.warning(
                    f"OBS failed to stop recording: {response.responseData}")

            await ws.disconnect()
            return {"status": "stopped"}

    except Exception as e:
        logger.error(f"Error while stopping recording: {e}")
        return {"status": "error", "message": str(e)}


# ---------------------------------------------------------------------
# Entry points for Flask integration
# ---------------------------------------------------------------------
def execute_script():
    """Entry point for /start_recordings"""
    try:
        return asyncio.run(main())
    except Exception as e:
        logger.error(f"Error running start script: {e}")
        return {"status": "error", "message": str(e)}


def stop_script():
    """Entry point for /stop_recordings"""
    try:
        return asyncio.run(stop_recording())
    except Exception as e:
        logger.error(f"Error running stop script: {e}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    asyncio.run(main())
