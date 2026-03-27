import React, { useEffect } from "react";

const BaselineSurvey = ({ surveyURL, subjectData, nextPage }) => {
    useEffect(() => {
        const handleMessage = (event) => {
            if (
                typeof event.data === "string" &&
                event.data.startsWith("QualtricsEOS|")
            ) {
                nextPage();
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [nextPage]);

    const embedURL =
        `${surveyURL}?subID=${encodeURIComponent(subjectData.subID)}&dyadID=${encodeURIComponent(subjectData.dyadID)}`;

    return (
        <div style={{ width: "100%", height: "100vh", border: "none" }}>
            <iframe
                src={embedURL}
                title="Qualtrics Survey"
                style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                }}
            />
        </div>
    );
};

export default BaselineSurvey;