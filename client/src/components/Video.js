import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { post } from "./Post.js";

export default function FullscreenVideoPlayer({ videoUrl, nextPage }) {
    const [phase, setPhase] = useState("preparing"); // preparing | countdown | playing | error
    const [countdown, setCountdown] = useState(5);
    const [error, setError] = useState("");

    const videoRef = useRef(null);
    const markedStartRef = useRef(false);
    const finishedRef = useRef(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (phase === "countdown" || phase === "playing") {
            document.body.style.cursor = "none";
        } else {
            document.body.style.cursor = "default";
        }

        return () => {
            document.body.style.cursor = "default";
        };
    }, [phase]);

    const safeExitFullscreen = async () => {
        try {
            if (!document.fullscreenElement) return;
            if (document.visibilityState !== "visible") return;
            await document.exitFullscreen();
        } catch {
            // ignore browser cleanup errors
        }
    };

    const markVideoStart = async () => {
        if (markedStartRef.current) return;
        markedStartRef.current = true;

        try {
            await post("/start_video_event", {
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
            await post("/end_video_event", {
                event: "video.end",
                timestamp_iso: new Date().toISOString(),
            });
        } catch (err) {
            console.error("end_video_event failed:", err);
        }

        try {
            await post("/stop_obs_recording");
        } catch (err) {
            console.error("stop_recordings failed:", err);
        }

        setTimeout(() => {
            nextPage();
        }, 500);

        await safeExitFullscreen();
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

    useEffect(() => {
        startCountdown();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (phase !== "playing") return;

        videoRef.current?.play().catch((err) => {
            console.error("video play failed:", err);
            setError("Video could not start");
            setPhase("error");
        });
    }, [phase]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "black",
                position: "relative",
                overflow: "hidden",
                cursor: phase === "countdown" || phase === "playing" ? "none" : "default",
            }}
        >
            {(phase === "countdown" || phase === "playing") && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        cursor: "none",
                        pointerEvents: "none",
                        background: "transparent",
                    }}
                />
            )}

            {phase === "countdown" && (
                <Box
                    sx={{
                        width: "100vw",
                        height: "100vh",
                        bgcolor: "#555555",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        inset: 0,
                        zIndex: 10000,
                        cursor: "none",
                    }}
                >
                    <Box sx={{ position: "relative", width: 32, height: 32 }}>
                        <Box
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                width: "100%",
                                height: "4px",
                                bgcolor: "black",
                                transform: "translateY(-50%)",
                            }}
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                left: "50%",
                                top: 0,
                                width: "4px",
                                height: "100%",
                                bgcolor: "black",
                                transform: "translateX(-50%)",
                            }}
                        />
                    </Box>
                </Box>
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
                        zIndex: 10000,
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
                onEnded={finishTask}
                onTimeUpdate={(e) => {
                    const t = e.target.currentTime;

                    if (!markedStartRef.current && t >= 0.03) {
                        markVideoStart();
                    }
                }}
                style={{
                    width: "100vw",
                    height: "100vh",
                    objectFit: "contain",
                    opacity: phase === "playing" ? 1 : 0,
                    pointerEvents: "none",
                    cursor: "none",
                }}
            />
        </div>
    );
}