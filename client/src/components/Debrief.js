import React, { useEffect, useRef } from "react";
import { Container, Typography } from "@mui/material";
import { Title } from "../StyledElements";

function Debrief({ saveParticipantFiles }) {
    const savedRef = useRef(false);

    useEffect(() => {
        if (savedRef.current) return;
        savedRef.current = true;
        saveParticipantFiles();
    }, [saveParticipantFiles]);

    return (
        <Container component="main" maxWidth="md" align="center">
            <br /><br /><br />
            <Title text="THANK YOU FOR YOUR PARTICIPATION!" />

            <Typography component="h2" variant="h6" align="left">
                <br />
                <br />
                You are all done with the study!
                Please step outside and check in with the experimenter to be debriefed about the study.
                <br />
                <br />
                If you have any questions or concerns, please feel free to ask the experimenter helping you today or
                contact the lead researcher (Amisha Vyas) at amisha.vyas@columbia.edu
                <br />
                <br />
                <br />
            </Typography>
        </Container>
    );
}

export default Debrief;