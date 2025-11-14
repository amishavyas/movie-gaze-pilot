import React from "react";
import { Container, Typography, Box } from "@mui/material";
import { StyledButton } from "../StyledElements";

const AudioInstructions = ({ nextPage }) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh", // full viewport height
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
                    textAlign: "center",
                }}
            >
                <Typography
                    component="h2"
                    variant="h6"
                    sx={{
                        textAlign: "center",
                        marginBottom: "40px",
                        lineHeight: 1.6,
                    }}
                >
                    Thanks for your attention while watching the video! <br />
                    <br />
                    For the next section, we are interested in learning what you thought
                    of the video. You will be recording yourself speak and will have three
                    minutes to provide your interpretation of the video. <br />
                    <br />
                    Specifically, we want to know:
                    <br />
                    <br />
                    What do you think the story is about? We are also interested in what
                    you remember from the video. In your response, you can talk about
                    characters, events, your opinions, and anything else that comes to
                    mind. Try to fill the whole three minutes and remember — there are no
                    wrong answers!
                    <br />
                    <br />
                    You will be able to see the above prompt on the recording page. When
                    you’re ready to start speaking, press the gray button to begin
                    recording. The progress bar will show your time remaining.
                    <br />
                    <br />
                    Press the <strong>Next</strong> button to continue to the recording
                    page.
                </Typography>

                <StyledButton handleClick={nextPage} text="Next" />
            </Container>
        </Box>
    );
};

export default AudioInstructions;
