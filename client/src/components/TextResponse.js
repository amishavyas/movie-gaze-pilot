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

function TextResponse({ recallInstructions, nextPage, responses, setResponses }) {
    const [recording, setRecording] = useState(false);
    const [progress, setProgress] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const animationRef = useRef(null);
    const RECORD_DURATION = 180; // 3 minutes

    const handleStart = async () => {
        if (recording) return; // Prevent double start

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach((t) => t.stop());
                setRecording(false);

                // Convert to WAV
                const arrayBuffer = await blob.arrayBuffer();
                const audioCtx = new AudioContext();
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                const wav = new WaveFile();
                wav.fromScratch(
                    audioBuffer.numberOfChannels,
                    audioBuffer.sampleRate,
                    "16",
                    audioBuffer.getChannelData(0)
                );
                const wavBlob = new Blob([wav.toBuffer()], { type: "audio/wav" });

                // Download locally
                const url = URL.createObjectURL(wavBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "participant_recording.wav";
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

                // Store and advance
                setResponses((prev) => [...prev, { audio: wavBlob }]);
                nextPage();
            };

            // Start recording
            mediaRecorder.start();
            setRecording(true);

            // Smooth progress animation
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
        } catch {
            alert("Microphone access denied or unavailable.");
        }
    };

    useEffect(() => () => cancelAnimationFrame(animationRef.current), []);

    return (
        <Container component="main" maxWidth="md" align="center">
            <Typography variant="h5" padding="3%" marginTop="30px" align="left">
                
                What do you think the story is about? We are also interested in what you remember from the video. In your response, you can talk about characters, events, your opinions, and anything else that comes to mind. 
                Try to fill the whole three minutes once the timer appears and remember - there are no wrong answers! <br /><br />
                Press the gray button when you are ready to start speaking.  
            </Typography>

            <Box sx={{ marginTop: "50px" }}>
                <IconButton
                    onClick={handleStart}
                    sx={{
                        backgroundColor: recording ? "#d32f2f" : "#9e9e9e",
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        transition: "background-color 0.3s ease",
                        "&:hover": { backgroundColor: recording ? "#b71c1c" : "#757575" },
                    }}
                >
                    <MicIconSVG />
                </IconButton>
            </Box>

            <Box sx={{ width: "100%", marginTop: "50px" }}>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                        height: "14px",
                        borderRadius: "7px",
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                            backgroundColor: "#d32f2f",
                            transition: "width 0.1s linear",
                        },
                    }}
                />
            </Box>
        </Container>
    );
}

export default TextResponse;
