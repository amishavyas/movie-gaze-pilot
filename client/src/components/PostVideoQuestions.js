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
    "Will this movie have a happy ending?",
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
        console.log(postVideoData[currentQuestion]); 
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
                paddingTop: "8vh",
            }}
        >
            <Container maxWidth="md">
                <Typography align="left" fontSize="21px">
                    <strong>Please read the question below and respond carefully.</strong>
                </Typography>

                <Box sx={{ marginTop: 6 }}>
                    <Typography component="h2" variant="h6" gutterBottom>
                        {currentQuestion}
                    </Typography>

                    <RadioGroup
                        row
                        value={postVideoData[currentQuestion] || ""}
                        onChange={(e) => handleChange(e.target.value)}
                        sx={{
                            "& .MuiFormControlLabel-label": {
                                fontSize: "1.25rem",
                            },
                        }}
                    >
                        <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                </Box>

                <Box sx={{ marginTop: 6, textAlign: "center" }}>
                    <StyledButton
                        handleClick={handleContinue}
                        text="NEXT"
                        buttonColor="#E4C988"
                    >
                        Continue
                    </StyledButton>
                </Box>
            </Container>
        </Box>
    );
};

export default PostVideoQuestions;