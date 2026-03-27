import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { StyledButton, Title } from "../StyledElements";

const GlassesInstruction = ({ nextPage }) => {


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
                    Next, we will ask you some Yes or No questions about the video.
                    For this portion of the study, you do not need to keep the glasses on.
                    <br />
                    <br />
                    <strong>
                        Please carefully remove the glasses and place them on the table, as demonstrated by the experimenter earlier.
                        They are delicate so make sure to be extra careful with them!
                    </strong>
                    <br />
                    <br />
                    Press NEXT when you are ready to continue. 
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

export default GlassesInstruction;