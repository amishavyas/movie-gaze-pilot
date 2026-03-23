import React, { useState } from "react";
import AudioInstructions from "./AudioInstructions";
import MovieInstructions from "./MovieInstructions";
import DemoSurvey from "./DemoSurvey";
import AudioResponse from "./AudioResponse";
import Debrief from "./Debrief";
import FullscreenVideoPlayer from "./Video";
import BaselineSurvey from "./BaselineSurvey";
import Calibration from "./Calibration";
import SessionInfo from "./SessionInfo";
import ExperimenterCheckpoint from "./ExperimenterCheckpoint";
import PostVideoQuestions from "./PostVideoQuestions";
import GlassesInstruction from "./GlassesInstruction";

function Experiment() {
    const [subjectData, setSubjectData] = useState({
        subID: "",
        dyadID: "",
    });
    const [postVideoData, setPostVideoData] = useState({
        "Have you watched this clip before?": "",
        "Are the blonde man with the mustache and the woman on the couch related?": "",
        "Are the characters discussing politics?": "",
        "Does the dark haired man standing in the doorframe make a convincing argument?": "",
        "Are the young woman and the blonde man related?": "",
        "Will this movie have a happy ending?": "",
    });
    const recallInstructions = "During this section, you will have three minutes to provide your interpretation of the video. What do you think the story is about? We are also interested in what you remember from the video.In your response, you can talk about characters, events, your opinions, and anything else that comes to mind. Try to fill the whole three minutes once the timer appears and remember - there are no wrong answers!";
    const [page, setPage] = useState(1);
    const [demoData, setDemoData] = useState({
        age: "",
        education: "",
        gender: "",
        sex: "",
        ethnicity: "",
        race: [],
    });

    const nextPage = () => setPage(page + 1);

    const downloadCSV = (dataObj, fileName) => {
        const headers = Object.keys(dataObj);
        const values = Object.values(dataObj);

        const csvContent =
            headers.join(",") +
            "\n" +
            values.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const saveParticipantFiles = () => {
        const demoExport = {
            subID: subjectData.subID,
            dyadID: subjectData.dyadID,
            ...demoData,
            race: demoData.race.join("; "),
        };

        const postVideoExport = {
            subID: subjectData.subID,
            dyadID: subjectData.dyadID,
            ...postVideoData,
        };

        const demoFileName = `${subjectData.subID}_${subjectData.dyadID}_demo.csv`;
        const postVideoFileName = `${subjectData.subID}_${subjectData.dyadID}_postVideo.csv`;

        downloadCSV(demoExport, demoFileName);

        setTimeout(() => {
            downloadCSV(postVideoExport, postVideoFileName);
        }, 500);
    };


    const conditionalComponent = () => {
        switch (page) {
            case 1:
                return <SessionInfo
                    subjectData={subjectData}
                    nextPage={nextPage}
                    setSubjectData={setSubjectData}
                />;

            case 2:
                return <BaselineSurvey
                    surveyURL="https://cumc.co1.qualtrics.com/jfe/form/SV_8xkcx3bGu8vwbbM"
                    participantID={100}
                    nextPage={nextPage}
                />;

            case 3:
                return <ExperimenterCheckpoint nextPage={nextPage} />;

            case 4:
                return <Calibration nextPage={nextPage} />;

            case 5:
                return <MovieInstructions nextPage={nextPage} />;

            case 6:
                return <FullscreenVideoPlayer
                    nextPage={nextPage}
                    videoUrl="./movie.mp4"
                />;
            case 7:
                return (
                    <GlassesInstruction
                        nextPage={nextPage}
                    />
                );
            case 8:
                return (
                    <AudioInstructions
                        nextPage={nextPage}
                    />
                );
            case 9:
                return (
                    <AudioResponse
                        nextPage={nextPage}
                        recallInstructions={recallInstructions}
                        subjectData={subjectData}
                    />
                );
            case 10:
                return (
                    <PostVideoQuestions
                        nextPage={nextPage}
                        postVideoData={postVideoData}
                        setPostVideoData={setPostVideoData}
                    />
                );
            case 11:
                return (
                    <DemoSurvey
                        nextPage={nextPage}
                        demoData={demoData}
                        setDemoData={setDemoData}
                    />
                );
            case 12:
                return <Debrief
                    saveParticipantFiles={saveParticipantFiles}
                />;
            default:
        }
    };

    return <div>{conditionalComponent()}</div>;
}

export default Experiment;
