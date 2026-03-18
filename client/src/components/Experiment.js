import React, { useState } from "react";
import AudioInstructions from "./AudioInstructions";
import MovieInstructions from "./MovieInstructions";
import DemoSurvey from "./DemoSurvey";
import AudioResponse from "./AudioResponse";
import Ratings from "./Ratings";
import Debrief from "./Debrief";
import FullscreenVideoPlayer from "./Video";
import BaselineSurvey from "./BaselineSurvey";
import Calibration from "./Calibration";
import { v4 as uuidv4 } from "uuid";

function Experiment() {
    const subID = useState(uuidv4());
    const recallInstructions = "During this section, you will have three minutes to provide your interpretation of the video. What do you think the story is about? We are also interested in what you remember from the video.In your response, you can talk about characters, events, your opinions, and anything else that comes to mind. Try to fill the whole three minutes once the timer appears and remember - there are no wrong answers!";
    const [page, setPage] = useState(1);
    const [responses, setResponses] = useState([]);
    const [demoData, setDemoData] = useState({
        age: "",
        education: "",
        gender: "",
        sex: "",
        ethnicity: "",
        race: [],
    });

    const nextPage = () => setPage(page + 1);

    const conditionalComponent = () => {
        switch (page) {
            case 1:
                return <BaselineSurvey
                    surveyURL="https://cumc.co1.qualtrics.com/jfe/form/SV_8xkcx3bGu8vwbbM"
                    participantID={100}
                    nextPage={nextPage}
                />;
            
            // Add post survey instructions where they are asked to get the RA 

            case 2:
                return <Calibration nextPage={nextPage} />;

            case 3:
                return <MovieInstructions nextPage={nextPage} />;

            case 4:
                return <FullscreenVideoPlayer
                    nextPage={nextPage}
                    videoUrl="./movie.mp4"
                    subID={subID}
                />;
            case 5:
                return (
                    <AudioInstructions
                        nextPage={nextPage}
                    />
                );
            case 6:
                return (
                    <AudioResponse
                        nextPage={nextPage}
                        recallInstructions={recallInstructions}
                        responses={responses}
                        setResponses={setResponses}
                    />
                );
            case 7:
                return (
                    <Ratings
                        nextPage={nextPage}
                        responses={responses}
                        setResponses={setResponses}
                    />
                );
            case 8:
                return (
                    <DemoSurvey
                        nextPage={nextPage}
                        demoData={demoData}
                        setDemoData={setDemoData}
                    />
                );
            case 9:
                return <Debrief />;
            default:
        }
    };

    return <div>{conditionalComponent()}</div>;
}

export default Experiment;
