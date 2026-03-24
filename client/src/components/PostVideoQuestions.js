import React, { useMemo, useState } from "react";
import {
    Box,
    Container,
    Typography,
    RadioGroup,
    Radio,
    FormControlLabel,
} from "@mui/material";
import { StyledButton } from "../StyledElements";

const fixedQuestion = "Have you watched this clip before?";

const randomQuestions = [
    "Are the blonde man with the mustache and the woman on the couch related?",
    "Are the characters discussing politics?",
    "Does the dark haired man standing in the doorframe make a convincing argument?",
    "Are the young woman and the blonde man related?",
    "Will there be a happy ending?",
];

const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
};

const PostVideoQuestions = ({ postVideoData, setPostVideoData, nextPage }) => {
    const shuffledQuestions = useMemo(() => shuffleArray(randomQuestions), []);
    const questions = [fixedQuestion, ...shuffledQuestions];

    const [questionIndex, setQuestionIndex] = useState(0);

    const currentQuestion = questions[questionIndex];

    const handleChange = (value) => {
        setPostVideoData({
            ...postVideoData,
            [currentQuestion]: value,
        });
    };

    const handleContinue = () => {
        if (!postVideoData[currentQuestion]) {
            alert("Please provide a response to continue.");
            return;
        }

        if (questionIndex < questions.length - 1) {
            setQuestionIndex(questionIndex + 1);
        } else {
            nextPage();
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "white",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                pt: "10vh",
                px: 2,
            }}
        >
            <Container maxWidth="lg">
                <Box
                    sx={{
                        //maxWidth: 760,
                        mx: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Typography
                        sx={{
                            width: "100%",
                            fontSize: "1.65rem",
                            lineHeight: 1.4,
                            textAlign: "center",
                            mb: 6,
                            whiteSpace: "nowrap",
                        }}
                    >
                        <strong>Please carefully read the question below. Click on the Yes or No button to respond.</strong>
                    </Typography>

                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: 650,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            component="h2"
                            sx={{
                                fontSize: "1.5rem",
                                fontWeight: 500,
                                lineHeight: 1.4,
                                mb: 4,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {currentQuestion}
                        </Typography>

                         
                        <RadioGroup
                            row
                            value={postVideoData[currentQuestion] || ""}
                            onChange={(e) => handleChange(e.target.value)}
                            sx={{
                                justifyContent: "center",
                                gap: 6,
                                "& .MuiFormControlLabel-root": {
                                    margin: 0,
                                },
                                "& .MuiFormControlLabel-label": {
                                    fontSize: "1.25rem",
                                },
                            }}
                        >
                            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio />} label="No" />
                        </RadioGroup>
                    </Box>

                    <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
                        <StyledButton
                            handleClick={handleContinue}
                            text="NEXT"
                            buttonColor="#E4C988"
                        />
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default PostVideoQuestions;