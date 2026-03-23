import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StyledButton, Title } from "../StyledElements";

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


                <Title text="INSTRUCTIONS" />
                <Typography component="h2" variant="h6" align="left">
                    <br />
                    
                    You are all set to begin! Now, you are about to watch a short movie clip. This clip has no audio, so please
                    don't worry about that. As you already know, your eyes will be recorded as you watch the clip.

                    <br />
                    <br />

                    The glasses work best when you don't move around, so please try to remain still and don't move back and forth.
                    Otherwise, you can relax and watch the movie as you naturally would.

                    <br />
                    <br />

                    After you are done watching the clip, we will ask you some questions about it.
                    Please make sure to pay close attention.
                    
                </Typography>

                <StyledButton handleClick={nextPage} text="NEXT" buttonColor="#e4d09e" />
            </Container>
        </Box>
    );
};

export default MovieInstructions;
