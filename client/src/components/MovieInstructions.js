import { React, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import { StyledButton, Title } from "../StyledElements";
import { post } from "./Post.js";

const MovieInstructions = ({ nextPage, subjectData }) => {

    const handleNext = async () => {
        try {
            const filename = `${subjectData?.subID || ""}_${subjectData?.dyadID || ""}_screen_recording`;

            const data = await post("/start_recordings", {
                filename,
            });

            if (data.status === "started" || data.status === "already_running") {
                nextPage();
            } else {
                throw new Error(data?.error || data?.message || "Failed to start recordings");
            }
        } catch (err) {
            console.error(err);

        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleNext();
        }, 40000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start", // top-aligned, not forced center
                minHeight: "100vh",
                backgroundColor: "white",
                paddingTop: "10vh", // pushes content down ~10% of viewport height
            }}
        >

            <Container component="main" maxWidth="md" align="center">


                <Title text="INSTRUCTIONS" />
                <Typography component="h2" variant="h6" align="left">
                    <br />

                    You are all set to begin! Now, you are about to watch a short video clip. This clip has no sound, so please
                    don't worry about that.

                    <br />
                    <br />

                    The glasses you are wearing will record your eyes as you watch. The glasses work best when you don't move around, so please try to remain still.
                    Otherwise, you can relax and watch the clip as you naturally would.

                    <br />
                    <br />

                    After you are done watching the clip, we will ask you some questions about it, so please make sure to pay close attention.

                    <br />
                    <br />

                    On the next page, you will see a cross on the screen like the one just saw.
                    Keep your eyes focused on the cross. The movie will play shortly on its own - make sure to
                    stay still and pay close attention.

                    <br />
                    <br />



                </Typography>

            </Container>
        </Box>
    );
};

export default MovieInstructions;
