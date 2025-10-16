import React, { useState, useEffect } from "react";
import { Container, TextField, Typography, LinearProgress } from "@mui/material";
import { StyledButton, StyledSlider } from "../StyledElements";

function TextResponse({text, nextPage, responses, setResponses }) {
    const [RT, setRT] = useState(0);
    const [interpretationText, setInterpretationText] = useState(""); 
    

    const nextTrial = () => {
        /*
            Record responses and move to the next trial only if the ratings slider has been moved
            If not, display an alert 
        */
        if (interpretationText !== "") {
            setResponses([ 
                ...responses,
                {
                    "interpretation": interpretationText, 
                    "RT": RT, 
                 }
            ]); 
            nextPage(); 
        }
        else {
            alert(
                "Please type your response to proceed."
            )
        }
        
    };

    return (
        <div>
             
            <Container component="main" maxWidth="md" align="center">
                <Typography variant="h5" padding="3%" marginTop="30px" align="left">
                    {text}
                     
                </Typography>
               

                <Container align="left"> 
                    <TextField
                    label=""
                    multiline
                    rows={2}
                    fullWidth
                    inputProps={{
                        autoComplete: 'off',
                        style: { fontSize: 19 }
                    }}
                    placeholder="Type your response here"
                        onChange={(e) =>
                            setInterpretationText(e.target.value)
                        }
        
                    variant="standard"
                    color="success"
                     
                    />
                </Container>
 

                <StyledButton handleClick={nextTrial} text="Next" />
            </Container>
        </div>
    );
}

export default TextResponse;