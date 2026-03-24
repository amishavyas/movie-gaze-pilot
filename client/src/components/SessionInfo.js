import React from "react";
import {
    Container,
    Typography,
} from "@mui/material";
import { Logos, StyledButton, Title, StyledTextField } from "../StyledElements";

function SessionInfo({ nextPage, subjectData, setSubjectData }) {

    const beginStudy = () => {
        if (validateInputs()) {
            nextPage();
        }
    };

    const validateInputs = () => {
        if (!subjectData.subID.trim()) {
            alert("Please enter Subject ID");
            return false;
        }

        if (!subjectData.dyadID.trim()) {
            alert("Please enter Dyad ID");
            return false;
        }

        return true;
    };

    return (
        <div>
            <Container component="main" maxWidth="md" align="center">
                <Logos />
                <Title text="FOR RESEARCHER ONLY" />

                <br /><br />

                <Typography align="left" fontSize="21px">
                    Please enter the subject and dyad information before beginning.
                </Typography>

                <br />

                <Typography align="left" component="h1" variant="h6">
                    <strong>Subject ID</strong>
                    <br />
                    <StyledTextField
                        value={subjectData.subID}
                        placeholder="s000"
                        onChange={(e) =>
                            setSubjectData({
                                ...subjectData,
                                subID: e.target.value,
                            })
                        }
                    />

                    <br />
                    <br />

                    <strong>Dyad ID</strong>
                    <br />
                    <StyledTextField
                        value={subjectData.dyadID}
                        placeholder="d000"
                        onChange={(e) =>
                            setSubjectData({
                                ...subjectData,
                                dyadID: e.target.value,
                            })
                        }
                    />
                </Typography>

                <br />

                <StyledButton
                    handleClick={beginStudy}
                    text="BEGIN STUDY"
                    buttonColor="#E4C988"
                />
            </Container>
        </div>
    );
}

export default SessionInfo;