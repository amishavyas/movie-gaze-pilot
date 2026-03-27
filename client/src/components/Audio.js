import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { WaveFile } from "wavefile";

const RECORD_MS = 30000 //180000; // 3 minutes

const post = async (url, body = {}) => {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || data?.message || `Request failed: ${res.status}`);
    }

    return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RecallScreen({ nextPage, setResponses, subjectData }) {
    const recorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const timeoutRef = useRef(null);
    const doneRef = useRef(false);

    const [showDone, setShowDone] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function startRecall() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                if (!isMounted) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = stream;

                const recorder = new MediaRecorder(stream, {
                    mimeType: "audio/webm;codecs=opus",
                });

                recorderRef.current = recorder;
                chunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        chunksRef.current.push(e.data);
                    }
                };

                recorder.onstop = async () => {
                    if (doneRef.current) return;
                    doneRef.current = true;

                    // Show "Done!" immediately before any async work,
                    // so it always appears regardless of what happens below.
                    setShowDone(true);

                    try {
                        if (streamRef.current) {
                            streamRef.current.getTracks().forEach((t) => t.stop());
                        }

                        const webmBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                        const arrayBuffer = await webmBlob.arrayBuffer();

                        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

                        const channelData = audioBuffer.getChannelData(0);
                        const int16Data = new Int16Array(channelData.length);

                        for (let i = 0; i < channelData.length; i++) {
                            int16Data[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7fff;
                        }

                        const wav = new WaveFile();
                        wav.fromScratch(1, audioBuffer.sampleRate, "16", int16Data);

                        const wavBlob = new Blob([wav.toBuffer()], { type: "audio/wav" });
                        const filename = `${subjectData.subID}_${subjectData.dyadID}_recall.wav`;

                        setResponses((prev) => [
                            ...prev,
                            {
                                audio: wavBlob,
                                filename,
                            },
                        ]);

                        await audioCtx.close();

                        const recallEndTime = Date.now();

                        await post("http://localhost:5001/send_event_marker", {
                            event: "end.recall",
                            timestamp_iso: new Date(recallEndTime).toISOString(),
                        });

                        // Keep "Done!" visible for 1 second total from when it appeared.
                        // The await above may have consumed some of that time, so wait
                        // only the remainder before hiding it and moving on.
                        await sleep(1000);
                        //setShowDone(false);

                        const remainingDelay = Math.max(0, 3000 - (Date.now() - recallEndTime));
                        if (remainingDelay > 0) {
                            await sleep(remainingDelay);
                        }

                        try {
                            await Promise.race([
                                post("http://localhost:5001/stop_tracker_recording"),
                                new Promise((_, reject) =>
                                    setTimeout(() => reject(new Error("stop_tracker_recording timed out")), 5000)
                                ),
                            ]);
                        } catch (err) {
                            console.error("stop_tracker_recording failed:", err);
                        }

                    
                        nextPage();
                         
                    } catch (err) {
                        console.error("Recall stop flow failed:", err);
                        // Even on error, keep "Done!" up briefly before advancing.
                        await sleep(1000);
                        setShowDone(false);
                        nextPage();
                        
                    }
                };

                await post("http://localhost:5001/send_event_marker", {
                    event: "start.recall",
                    timestamp_iso: new Date().toISOString(),
                });

                recorder.start();

                timeoutRef.current = setTimeout(() => {
                    if (recorder.state !== "inactive") {
                        recorder.stop();
                    }
                }, RECORD_MS);
            } catch (err) {
                console.error("Failed to start recall:", err);
            }
        }

        startRecall();

        return () => {
            isMounted = false;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            if (recorderRef.current && recorderRef.current.state !== "inactive") {
                recorderRef.current.stop();
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, [nextPage, setResponses, subjectData]);

    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                bgcolor: "#555555",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "none",
            }}
        >
            {showDone ? (
                <Typography
                    sx={{
                        color: "black",
                        fontSize: "3rem",
                        fontWeight: 500,
                    }}
                >
                    Done!
                </Typography>
            ) : (
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
            )}
        </Box>
    );
}