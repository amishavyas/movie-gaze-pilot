import React, { useState } from "react";
import Consent from "./Consent";
import DemoSurvey from "./DemoSurvey";
import TextResponse from "./TextResponse";
import Ratings from "./Ratings";
import Debrief from "./Debrief";
import FullscreenVideoPlayer from "./Video";
import { v4 as uuidv4 } from "uuid";

// TASK = consent -> turn 1
function Experiment() {
    const subID = useState(uuidv4());
    const text = "What is your interpretation of the movie in your own words? Please use the text box below to enter your response in no more than a couple lines.";
    const [page, setPage] = useState(1);
    const [responses, setResponses] = useState([]);
    const stimOrder = ["dominant", "bossy", "trustworthy", "happy"];
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
                return <Consent nextPage={nextPage} />;
            case 2:
                return <FullscreenVideoPlayer
                    nextPage={nextPage}
                    videoUrl="./movie.mp4"
                    subID={subID}
                />;
            case 3:
                return (
                    <TextResponse
                        nextPage={nextPage}
                        text={text}
                        responses={responses}
                        setResponses={setResponses}
                    />
                );
            case 4:
                return (
                    <Ratings
                        nextPage={nextPage}
                        text={responses[0]["interpretation"]}
                        responses={responses}
                        setResponses={setResponses}
                    />
                );
            case 5:
                return (
                    <DemoSurvey
                        nextPage={nextPage}
                        demoData={demoData}
                        setDemoData={setDemoData}
                    />
                );
            case 6:
                return <Debrief />;
            default:
        }
    };

    return <div>{conditionalComponent()}</div>;
}

export default Experiment;
