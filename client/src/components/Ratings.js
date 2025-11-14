import React, { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import { StyledButton, StyledSlider } from "../StyledElements";

function Ratings({ nextPage, responses, setResponses }) {
    const [RT, setRT] = useState(0);
    const [slider, setSlider] = useState({ value: 0, moved: false });

    const setTrial = () => {
        setRT(Date.now());
        setSlider({ value: 0, moved: false });
    };

    const nextTrial = () => {
        if (slider.moved) {
            setResponses([
                ...responses,
                { rating: slider.value, RT: Date.now() - RT },
            ]);
            nextPage();
        } else {
            alert(
                "Please move the slider from its default position to continue, even if your response is 0."
            );
        }
    };

    const handleSlider = (e, newValue) => {
        setSlider({ value: newValue, moved: true });
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start", // top-aligned, not forced center
                minHeight: "100vh",
                paddingTop: "10vh", // pushes content down ~10% of viewport height
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
                    variant="h5"
                    sx={{ padding: "2%", marginBottom: "40px", textAlign: "center" }}
                >
                    Using the slider below, please rate how confident you are in your
                    interpretation that you just provided.
                </Typography>

                <StyledSlider
                    value={slider.value}
                    onChange={handleSlider}
                    min={-50}
                    max={50}
                    sx={{ width: "80%", marginBottom: "40px" }}
                />

                <StyledButton handleClick={nextTrial} text="Next" />
            </Container>
        </Box>
    );
}

export default Ratings;
