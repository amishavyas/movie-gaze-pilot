import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StyledButton, Title } from "../StyledElements";

const Consent = ({ nextPage }) => {
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
             
            <Title text="Welcome to the part 2 of the study!" />

            <Typography component="h2" variant="h6" align="left">
                <br />
                <br />
                Thank you for filling out the surveys!
                For your next task, you will watch a short movie clip and answer questions about it. 

                <br />
                <br />
                We will be recording your eyes as you watch the video.
                The glasses work best when you don't move around, so please try to remain still and don't move back and forth. 
                Otherwise, you can relax and watch the movie as you naturally would. 
                <br />
                <br />
                The movie you are about to watch is [...]. 
                 
            </Typography>

            <StyledButton handleClick={nextPage} text="Watch Video" buttonColor="#e4d09e" />
            </Container>
        </Box>
    );
};

export default Consent;
