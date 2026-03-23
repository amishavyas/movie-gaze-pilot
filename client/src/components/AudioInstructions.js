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
                        textAlign: "left",
                        marginBottom: "40px",
                        lineHeight: 1.6,
                    }}
                >
                
                    We are interested in learning what you thought
                    about the video. <strong> For the next part, you will be recording yourself speak and will have three
                        minutes to provide your interpretation of the video. </strong> <br />
                    <br />
                    Specifically, we want to know:
                    <br />
                    <br />
                    <strong> 
                    What do you think the story is about? We are also interested in what
                    you remember from the video. In your response, you can talk about
                    characters, events, your opinions, and anything else that comes to
                    mind. Try to fill the whole three minutes and remember — there are no
                        wrong answers!
                    </strong>
                    <br />
                    <br />
                    You will be able to see the above prompt on the recording page. When
                    you’re ready to start speaking, press the mic button to begin
                    recording. A progress bar will show how much time you have left.
                    <br />
                    <br />
                    Press the <strong>Next</strong> button to continue to the recording
                    page.
                </Typography>

                <StyledButton handleClick={nextPage} text="Next" buttonColor="#E4C988" />
            </Container>
        </Box>
    );
};

export default AudioInstructions;
