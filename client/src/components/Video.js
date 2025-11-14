import { useState, useEffect, useRef } from "react";

const FullscreenVideoPlayer = ({ videoUrl, nextPage }) => {
    const [phase, setPhase] = useState("preparing");
    const [countdown, setCountdown] = useState(3);
    const [showCountdown, setShowCountdown] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        const goFullscreen = async () => {
            try {
                const el = document.documentElement;
                console.log("[DEBUG] Requesting fullscreen...");
                if (el.requestFullscreen) await el.requestFullscreen();
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            } catch (err) {
                console.warn("Fullscreen request failed:", err);
                setPhase("ready");
            }
        };

        const handleFullscreenChange = () => {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                console.log("[DEBUG] Fullscreen entered:", new Date().toISOString());
                setCountdown(3);

                const interval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            console.log("[DEBUG] Countdown complete:", new Date().toISOString());
                            setTimeout(() => {
                                setShowCountdown(false);
                                setPhase("ready");
                            }, 800);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                console.log("[DEBUG] Fullscreen exited — stopping recordings...");
                fetch("http://localhost:8000/stop_recordings").catch(() => { });
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        goFullscreen();

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        if (phase !== "ready") return;

        const vid = videoRef.current;
        if (!vid) return;
        console.log("[DEBUG] Phase=ready: preparing to start recordings...");

        // Add 100 ms delay before playback begins
        setTimeout(() => {
            console.log("[DEBUG] Starting video playback after 100 ms delay...");

            const startVideo = async () => {
                try {
                    await vid.play();
                    console.log("[DEBUG] Video playing successfully");

                    // Start OBS + eyetracker slightly after playback begins
                    setTimeout(() => {
                        console.log("[DEBUG] Triggering /start_recordings after stabilization...");
                        fetch("http://localhost:8000/start_recordings")
                            .then(() => {
                                console.log("[DEBUG] /start_recordings acknowledged");

                                fetch("http://localhost:8000/start_video_event", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        js_start_time_ms: performance.now(),
                                        timestamp_iso: new Date().toISOString(),
                                    }),
                                }).catch(() => { });
                            })
                            .catch(() => console.warn("Failed to start recordings"));
                    }, 200); // stabilization delay (after playback begins)
                } catch (err) {
                    console.warn("[WARN] Video play() failed initially, retrying...");
                    setTimeout(startVideo, 500);
                }
            };

            startVideo();
        }, 1200); // ← this is the 100 ms delay before starting playback
    }, [phase]);

    const handleEnded = () => {
        console.log("[DEBUG] Video ended — stopping recording...");
        fetch("http://localhost:8000/stop_recordings").catch(() => { });
        document.exitFullscreen().catch(() => { });
        setTimeout(nextPage, 1000);
    };

    return (
        <div
            className="w-full h-full flex items-center justify-center"
            style={{
                cursor: "none",
                backgroundColor: "black",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {showCountdown && (
                <div
                    key={countdown}
                    style={{
                        color: "#FFFFFF",
                        fontSize: "12rem",
                        fontWeight: "700",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        userSelect: "none",
                        animation: "countFade 1.2s ease-in-out",
                        opacity: 1,
                    }}
                >
                    {countdown > 0 ? countdown : ""}
                </div>
            )}

            {phase === "ready" && (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    muted
                    playsInline
                    onEnded={handleEnded}
                    style={{
                        width: "100vw",
                        height: "100vh",
                        objectFit: "contain",
                        backgroundColor: "black",
                        transition: "opacity 1s ease-in-out",
                        opacity: showCountdown ? 0 : 1,
                    }}
                />
            )}

            <style>
                {`
          @keyframes countFade {
            0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
            30%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            70%  { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.25); }
          }
        `}
            </style>
        </div>
    );
};

export default FullscreenVideoPlayer;
