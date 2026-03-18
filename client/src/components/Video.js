import { useEffect, useRef, useState } from "react";

export default function FullscreenVideoPlayer({ videoUrl, nextPage }) {
    const [phase, setPhase] = useState("preparing");
    const [countdown, setCountdown] = useState(5);

    const videoRef = useRef(null);
    const startedRef = useRef(false);
    const startMarked = useRef(false);

    const markVideoStart = () => {
        if (startMarked.current) return;
        startMarked.current = true;

        fetch("http://localhost:5001/start_video_event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "video.start",
                timestamp_iso: new Date().toISOString(),
            }),
        }).catch(() => { });
    };

    const handleEnded = () => {
        fetch("http://localhost:5001/end_video_event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                event: "video.end",
                timestamp_iso: new Date().toISOString(),
            }),
        }).catch(() => { });

        setTimeout(() => {
            fetch("http://localhost:5001/stop_recordings", {
                method: "POST",
            }).catch(() => { });

            document.exitFullscreen?.();
            setTimeout(nextPage, 1000);
        }, 3000);
    };

    useEffect(() => {
        const startCountdown = () => {
            let n = 5;
            setCountdown(n);

            const interval = setInterval(() => {
                n -= 1;
                setCountdown(n);

                if (n === 0) {
                    clearInterval(interval);
                    setPhase("ready");
                }
            }, 1000);
        };

        const startTask = async () => {
            await document.documentElement.requestFullscreen();

            if (startedRef.current) return;
            startedRef.current = true;

            const res = await fetch("http://localhost:5001/start_recordings", {
                method: "POST",
            });

            const data = await res.json();
            console.log("start_recordings:", data);

            if (data.status === "started" || data.status === "already_running") {
                startCountdown();
            }
        };

        startTask();
    }, []);

    useEffect(() => {
        if (phase !== "ready") return;
        videoRef.current?.play();
    }, [phase]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "black",
                position: "relative",
                cursor: "none",
            }}
        >
            {phase !== "ready" && (
                <div
                    style={{
                        color: "white",
                        fontSize: "12rem",
                        fontWeight: 700,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    {countdown}
                </div>
            )}

            <video
                ref={videoRef}
                src={videoUrl}
                muted
                playsInline
                onPlay={markVideoStart}
                onEnded={handleEnded}
                style={{
                    width: "100vw",
                    height: "100vh",
                    objectFit: "contain",
                    opacity: phase === "ready" ? 1 : 0,
                }}
            />
        </div>
    );
}