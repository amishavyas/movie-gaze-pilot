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
        document.body.style.cursor = "none";
        document.documentElement.style.cursor = "none";
        document.body.classList.add("hide-cursor");

        return () => {
            document.body.style.cursor = "default";
            document.documentElement.style.cursor = "default";
            document.body.classList.remove("hide-cursor");
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
                backgroundColor: "#555555",
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
                        position: "relative",
                        width: 32,
                        height: 32,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            width: "100%",
                            height: "4px",
                            backgroundColor: "black",
                            transform: "translateY(-50%)",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            left: "50%",
                            top: 0,
                            width: "4px",
                            height: "100%",
                            backgroundColor: "black",
                            transform: "translateX(-50%)",
                        }}
                    />
                </div>
            )}
        </div>
    );
}