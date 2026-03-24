import { useEffect, useState } from "react";

export default function Calibration({ nextPage }) {
    const [status, setStatus] = useState("Connecting to eyetracker...");
    const [showCross, setShowCross] = useState(false);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let mounted = true;

        const connectTracker = async () => {
            try {
                const res = await fetch("http://localhost:5001/connect_tracker", {
                    method: "POST",
                });

                const data = await res.json();
                console.log("connect_tracker:", data);

                if (!mounted) return;

                if (
                    res.ok &&
                    (data.status === "connected" || data.status === "already_connected")
                ) {
                    setStatus("Connected!");

                    setTimeout(() => {
                        if (!mounted) return;
                        setStatus("");
                        setShowCross(true);
                        setReady(true);
                    }, 1000);
                } else {
                    setStatus("Could not connect to eyetracker.");
                }
            } catch (err) {
                console.error(err);
                if (mounted) setStatus("Could not connect to eyetracker.");
            }
        };

        connectTracker();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Enter" && ready) {
                nextPage();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [ready, nextPage]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "white",
                color: "black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {!showCross ? (
                <div style={{ fontSize: "2rem", textAlign: "center" }}>
                    {status}
                </div>
            ) : (
                <div
                    style={{
                        fontSize: "6rem",
                        lineHeight: 1,
                        userSelect: "none",
                    }}
                >
                    +
                </div>
            )}
        </div>
    );
}