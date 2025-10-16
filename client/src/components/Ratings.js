import React, { useState } from "react";
import {Box, Container, Typography  } from "@mui/material";
import { StyledButton, StyledSlider } from "../StyledElements";

function Ratings({ text, nextPage, responses, setResponses }) {
    const [RT, setRT] = useState(0);
    const [slider, setSlider] = useState({
        value: 0,
        moved: false,
    });

    const setTrial = () => {
        /* Resetting states (RT, new stim, slider values) for the new trial */
        setRT(Date.now());
 
        setSlider({ value: 0, moved: false });
    };

    const nextTrial = () => {
        /*
            Record responses and move to the next trial only if the ratings slider has been moved
            If not, display an alert 
        */
        if (slider.moved) {
            setResponses([
                ...responses,
                {
                    rating: slider.value,
                    RT: Date.now() - RT,
                },
            ]);
            nextPage(); 
            
        } else {
            alert(
                "Please move the slider from its default position to continue, even if your response is 0."
            );
        }
    };

    const handleSlider = (e, newValue) => {
        /* 
            Record new slider value and that it has been interacted with
            Users cannot proceed to the next trial without moving the slider
            from its default position 
        */
        setSlider({ value: newValue, moved: true });
    };
 

    return (
        <div>
             
            <Container component="main" maxWidth="md" align="center">

                <Typography variant="h5" padding="2%" marginTop="30px" align="left">
                    Your interpretation: 
                    <br /><br />
                    {' '}
                    <Box component="span" sx={{ fontStyle: 'italic', color: '#d32f2f' }}>
                        {text}
                    </Box>
                    <br /> <br />
                    Using the slider below, please rate how confident you are in this interpretation.
                </Typography>

                <Container align="left">  
                    <StyledSlider
                        value={slider.value}
                        onChange={handleSlider}
                        min={-50}
                        max={50}
                        style={{ marginTop: "20px" }}
                        />
                </Container>  

                <StyledButton handleClick={nextTrial} text="Next" />
            </Container>
        </div>
    );
}

export default Ratings;