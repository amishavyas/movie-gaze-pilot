import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { StyledButton } from "../StyledElements";
//import { post } from "./Post.js";


const post = (url, body = {}) =>
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

const AudioInstructions = ({ nextPage }) => {
    const [error, setError] = useState("");

    const handleNext = async () => {
        setError("");

        try {
            await post("http://localhost:5001/start_tracker_recording_route");

            setTimeout(() => {
                nextPage();
            }, 2000);

        } catch (err) {
            setError(err.message || "Tracker connection failed. Please call the experimenter.");
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "white",
            }}
        >
            <Container
                component="main"
                maxWidth="md"
                align="center"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Typography
                    component="h2"
                    variant="h6"
                    sx={{
                        textAlign: "left",
                        marginBottom: "40px",
                        lineHeight: 1.6,
                    }}
                >
                    We are interested in learning what you thought about the video.
                    <strong> In the next part, you will have <strong> 3 minutes </strong> to describe your interpretation of the video out loud.</strong>
                    <br />
                    <br />
                    Specifically, we want to know:
                    <br />
                    <br />
                    <strong>
                        What do you think the story is about? We are also interested in what
                        you remember from the video. In your response, you can talk about
                        characters, events, your opinions, and anything else that comes to
                        mind. Try to fill the whole three minutes, and remember that there are no
                        wrong answers.
                    </strong>
                    <br />
                    <br />
                    On the following page, you will see a cross on the screen.
                    <br/>
                    <strong style={{ color: "#ad1313" }}> Please keep your eyes focused on the cross the whole time and speak until the screen says "Done!". </strong>
                    <br />
                    <br />
                    If you have any questions at this point, please ask the experimenter before continuing.

                    <br />
                    <br />
                    Press <strong>NEXT</strong> when you are ready. The recording will begin automatically. 
                </Typography>

                {error && (
                    <Typography sx={{ color: "red", mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <StyledButton
                    handleClick={nextPage}
                    text="Next"
                    buttonColor="#E4C988"
                />
            </Container>
        </Box>
    );
};

export default AudioInstructions;