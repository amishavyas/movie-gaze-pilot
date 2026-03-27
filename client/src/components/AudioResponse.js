import React, { useState, useRef, useEffect } from "react";
import { Container, Typography, LinearProgress, Box, IconButton } from "@mui/material";
import { WaveFile } from "wavefile";

function MicIconSVG() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40" fill="white">
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 18h2v4h-2v-4z" />
        </svg>
    );
}

async function post(url, body = {}) {
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
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AudioResponse({ subjectData, nextPage, setResponses }) {
    const [recording, setRecording] = useState(false);
    const [progress, setProgress] = useState(0);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const animationRef = useRef(null);
    const trackerStartedRef = useRef(false);
    const endedRef = useRef(false);

    const RECORD_DURATION = 180;

    // useEffect(() => {
    //     const startTrackerRecording = async () => {
    //         if (trackerStartedRef.current) return;
    //         trackerStartedRef.current = true;

    //         try {
    //             const filename = `${subjectData.subID}_${subjectData.dyadID}_recall`;
    //             await post("http://localhost:5001/start_tracker_recording", { filename });
    //             console.log("Tracker recording started");
    //         } catch (err) {
    //             console.error("Failed to start tracker recording:", err);
    //         }
    //     };

    //     startTrackerRecording();

    //     return () => {
    //         if (animationRef.current) {
    //             cancelAnimationFrame(animationRef.current);
    //         }
    //     };
    // }, [subjectData.subID, subjectData.dyadID]);

    const finishRecall = async () => {
        if (endedRef.current) return;
        endedRef.current = true;

        try {
            await post("http://localhost:5001/send_event_marker", {
                event: "recall.end",
                timestamp_iso: new Date().toISOString(),
            });
            console.log("recall.end sent");
        } catch (err) {
            console.error("Failed to send recall.end:", err);
        }

        try {
            await sleep(3000);
            await post("http://localhost:5001/stop_tracker_recording");
            console.log("Tracker recording stopped");
        } catch (err) {
            console.error("Failed to stop tracker recording:", err);
        }

        nextPage();
    };

    const handleStart = async () => {
        if (recording) return;

        try {
            await post("http://localhost:5001/send_event_marker", {
                event: "recall.start",
                timestamp_iso: new Date().toISOString(),
            });

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                try {
                    stream.getTracks().forEach((t) => t.stop());
                    setRecording(false);

                    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                    const arrayBuffer = await blob.arrayBuffer();

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

                    setResponses((prev) => [...prev, { audio: wavBlob }]);

                    await finishRecall();
                } catch (err) {
                    console.error("Failed during recall stop flow:", err);
                    await finishRecall();
                }
            };

            mediaRecorder.start();
            setRecording(true);
            setProgress(0);

            const startTime = Date.now();

            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                setProgress(Math.min((elapsed / RECORD_DURATION) * 100, 100));

                if (elapsed < RECORD_DURATION) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    mediaRecorder.stop();
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        } catch (err) {
            console.error("Failed to start recall recording:", err);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                backgroundColor: "white",
                pt: "10vh",
                px: 3,
            }}
        >
            <Container component="main" maxWidth="md" align="center">
                <Box sx={{ mx: "auto" }}>
                    <Typography
                        component="h2"
                        variant="h6"
                        align="left"
                        sx={{ lineHeight: 1.7, fontWeight: 400, mb: 5 }}
                    >
                        <strong>
                            What do you think the story is about? We are also interested in what
                            you remember from the video. In your response, you can talk about
                            characters, events, your opinions, and anything else that comes to mind.
                        </strong>
                        <br />
                        <br />
                        Try to fill the whole three minutes — there are no wrong answers.
                        <br />
                        <br />
                        When you’re ready, press the button below. The button will turn red
                        while recording, and the progress bar will fill as time passes.
                        Recording will stop automatically when the bar is full.
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
                        <IconButton
                            onClick={handleStart}
                            disabled={recording}
                            sx={{
                                backgroundColor: recording ? "#d32f2f" : "#9e9e9e",
                                width: 110,
                                height: 110,
                                borderRadius: "50%",
                                boxShadow: 2,
                                "&:hover": {
                                    backgroundColor: recording ? "#d32f2f" : "#757575",
                                },
                                "&.Mui-disabled": {
                                    backgroundColor: "#d32f2f",
                                    color: "white",
                                },
                            }}
                        >
                            <MicIconSVG />
                        </IconButton>
                    </Box>

                    <Box sx={{ width: "100%", maxWidth: 700, mx: "auto" }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 14,
                                borderRadius: 7,
                                backgroundColor: "#e0e0e0",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#d32f2f",
                                    transition: "width 0.1s linear",
                                },
                            }}
                        />
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}