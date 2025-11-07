import React, { useState } from "react";
import AudioInstructions from "./AudioInstructions";
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
                return <Consent nextPage={nextPage} />;
            case 2:
                return <FullscreenVideoPlayer
                    nextPage={nextPage}
                    videoUrl="./movie.mp4"
                    subID={subID}
                />;
            case 3:
                return (
                    <AudioInstructions
                        nextPage={nextPage}
                    />
                );
            case 4:
                return (
                    <TextResponse
                        nextPage={nextPage}
                        recallInstructions={recallInstructions}
                        responses={responses}
                        setResponses={setResponses}
                    />
                );
            case 5:
                return (
                    <Ratings
                        nextPage={nextPage}
                        responses={responses}
                        setResponses={setResponses}
                    />
                );
            case 6:
                return (
                    <DemoSurvey
                        nextPage={nextPage}
                        demoData={demoData}
                        setDemoData={setDemoData}
                    />
                );
            case 7:
                return <Debrief />;
            default:
        }
    };

    return <div>{conditionalComponent()}</div>;
}

export default Experiment;
