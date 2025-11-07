import React from "react";
import { Container, Typography } from "@mui/material";
import { StyledButton } from "../StyledElements";

const AudioInstructions = ({ nextPage }) => {
    return (
        <Container component="main" maxWidth="md" align="center" style={{
            paddingTop: "5%",
        }}>

            <Typography component="h2" variant="h6" align="left">
                Thanks for your attention while watching the video! 
                For the next section, we are interested in learning what you thought of the video. You will be recording yourself speak and will have three minutes to provide your interpretation of the video. <br /><br />
                
                Specifically, we want to know:
                
                What do you think the story is about? We are also interested in what you remember from the video. In your response, you can talk about characters, events, your opinions, and anything else that comes to mind.
                Try to fill the whole three minutes once the timer appears and remember - there are no wrong answers! 

                <br /><br />

                You will be able to see the above prompt on the recording page. 
                Whenever you are ready to start speaking, you will press the gray button to start recording.
                A progress bar will indicate how long you have left.

                <br /><br />

                Press the "Next" button to proceed to the recording page.
                 
            </Typography>

            <StyledButton handleClick={nextPage} text="Next" buttonColor="#e4d09e" />
        </Container>
    );
};

export default AudioInstructions;
