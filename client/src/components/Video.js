import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { StyledButton } from "../StyledElements";


export default function FullscreenVideoPlayer({ videoUrl, nextPage }) {
    const [phase, setPhase] = useState("preparing"); // preparing | countdown | playing | error
    const [countdown, setCountdown] = useState(5);
    const [error, setError] = useState("");

    const videoRef = useRef(null);
    const startedRef = useRef(false);
    const markedStartRef = useRef(false);
    const finishedRef = useRef(false);
    const timerRef = useRef(null);

    const post = async (url, body) => {
        const res = await fetch(url, {
            method: "POST",
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined,
        });

        let data = {};
        try {
            data = await res.json();
        } catch {
            // ignore empty/non-json responses
        }

        if (!res.ok) {
            throw new Error(data?.error || `Request failed: ${res.status}`);
        }

        return data;
    };

    const safeEnterFullscreen = async () => {
        if (document.fullscreenElement) return;

        try {
            await document.documentElement.requestFullscreen();
        } catch (err) {
            throw new Error("Could not enter fullscreen. Start must come from a user click.");
        }
    };

    const safeExitFullscreen = async () => {
        try {
            if (!document.fullscreenElement) return;
            if (document.visibilityState !== "visible") return;
            await document.exitFullscreen();
        } catch {
            // ignore "Document not active" and related browser cleanup errors
        }
    };

    const markVideoStart = async () => {
        if (markedStartRef.current) return;
        markedStartRef.current = true;

        try {
            await post("http://localhost:5001/start_video_event", {
                event: "video.start",
                timestamp_iso: new Date().toISOString(),
            });
        } catch (err) {
            console.error("start_video_event failed:", err);
        }
    };

    const finishTask = async () => {
        if (finishedRef.current) return;
        finishedRef.current = true;

        try {
            await post("http://localhost:5001/end_video_event", {
                event: "video.end",
                timestamp_iso: new Date().toISOString(),
            });
        } catch (err) {
            console.error("end_video_event failed:", err);
        }

        try {
            await fetch("http://localhost:5001/stop_recordings", {
                method: "POST",
            });
        } catch (err) {
            console.error("stop_recordings failed:", err);
        }

        await safeExitFullscreen();

        setTimeout(() => {
            nextPage?.();
        }, 500);
    };

    const startCountdown = () => {
        setPhase("countdown");
        setCountdown(5);

        let n = 5;
        timerRef.current = setInterval(() => {
            n -= 1;
            setCountdown(n);

            if (n <= 0) {
                clearInterval(timerRef.current);
                timerRef.current = null;
                setPhase("playing");
            }
        }, 1000);
    };

    const handleStart = async () => {
        if (startedRef.current) return;
        startedRef.current = true;
        setError("");

        try {
            await safeEnterFullscreen();

            const data = await post("http://localhost:5001/start_recordings");

            if (data.status === "started" || data.status === "already_running") {
                startCountdown();
            } else {
                throw new Error(data?.error || "Permissions check failed");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to start");
            setPhase("error");
            startedRef.current = false;
        }
    };

    useEffect(() => {
        if (phase !== "playing") return;

        videoRef.current?.play().catch((err) => {
            console.error("video play failed:", err);
            setError("Video could not start");
            setPhase("error");
        });
    }, [phase]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "black",
                position: "relative",
                overflow: "hidden",
                cursor: "none",
            }}
        >
            {phase === "preparing" && (
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                    }}
                >
                    <StyledButton
                        handleClick={handleStart}
                        text="Click to play video"
                        fontSize="24px"
                         
                    />
                </Box>
            )}

            {phase === "countdown" && (
                <div
                    style={{
                        color: "white",
                        fontSize: "12rem",
                        fontWeight: 700,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                    }}
                >
                    {countdown}
                </div>
            )}

            {phase === "error" && (
                <div
                    style={{
                        color: "white",
                        fontSize: "2rem",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 10,
                    }}
                >
                    {error || "Something went wrong"}
                </div>
            )}

            <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                onPlay={markVideoStart}
                onEnded={finishTask}
                style={{
                    width: "100vw",
                    height: "100vh",
                    objectFit: "contain",
                    opacity: phase === "playing" ? 1 : 0,
                }}
            />
        </div>
    );
}