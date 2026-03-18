import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StyledButton } from "../StyledElements";

const MovieInstructions = ({ nextPage }) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start", // top-aligned, not forced center
                minHeight: "100vh",
                backgroundColor: "white",
                paddingTop: "10vh", // pushes content down ~10% of viewport height
            }}
        >

            <Container component="main" maxWidth="md" align="center">

                <Typography component="h2" variant="h6" align="left">
                    <br />
                    <br />
                    Now, you are about to watch a short video and then answer some questions about it.
                    Please make sure to pay close attention.

                    <br />
                    <br />
                    As you already know, your eyes will be recorded as you watch the video.
                    The glasses work best when you don't move around, so please try to remain still and don't move back and forth.
                    Otherwise, you can relax and watch the movie as you naturally would.
                    <br />
                    <br />
                    The movie you are about to watch is [...].

                </Typography>

                <StyledButton handleClick={nextPage} text="Begin Video" buttonColor="#e4d09e" />
            </Container>
        </Box>
    );
};

export default MovieInstructions;
