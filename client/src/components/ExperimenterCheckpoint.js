import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StyledButton, Title } from "../StyledElements";

const ExperimenterCheckpoint = ({ nextPage }) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                minHeight: "100vh",
                backgroundColor: "white",
                paddingTop: "10vh",
            }}
        >
            <Container component="main" maxWidth="md" align="center">
                <Title text="INSTRUCTIONS" />
                <Typography component="h2" variant="h6" align="left">
                    <br />
                    <br />
                    Thanks for completing the survey! We are excited for you to begin the main task.
                    <br />
                    <br />
                    <strong>Please step out and let the experimenter know that you are done with the survey.
                        They will help you get ready for the next part of the study.</strong>
                </Typography>

                <StyledButton
                    handleClick={nextPage}
                    text="Next"
                    buttonColor="#e4d09e"
                />
            </Container>
        </Box>
    );
};

export default ExperimenterCheckpoint;