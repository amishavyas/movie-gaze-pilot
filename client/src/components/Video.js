import { useState, useRef, useEffect } from 'react';

// THIS CODE IS FULL SCREEN WITHOUT CROPPING 
const FullscreenVideoPlayer = ({ videoUrl, nextPage }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [hasEnded, setHasEnded] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const videoRef = useRef(null);
    const hasStartedRecording = useRef(false);

    const handlePlay = () => {
        setIsPlaying(true);
        setHasEnded(false);

        if (!hasStartedRecording.current) {
            hasStartedRecording.current = true;

            fetch("http://localhost:8000/start_recordings")
                .then((res) => res.json())
                .then((data) => {
                    console.log("Recording API response:", data);
                })
                .catch((err) => {
                    console.error("Error starting recording:", err);
                });
        }

        // Request fullscreen on the video itself
        if (videoRef.current && !isFullscreen) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if (videoRef.current.webkitRequestFullscreen) {
                videoRef.current.webkitRequestFullscreen();
            } else if (videoRef.current.mozRequestFullScreen) {
                videoRef.current.mozRequestFullScreen();
            } else if (videoRef.current.msRequestFullscreen) {
                videoRef.current.msRequestFullscreen();
            }
            setIsFullscreen(true);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setHasEnded(true);

       
        //setIsFullscreen(false);
        setTimeout(nextPage, 1000);
    };

    useEffect(() => {
        if (isPlaying) {
            fetch("/start_recordings", {
                method: "GET",
            });
        }
    }, [isPlaying]);

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            setIsFullscreen(isCurrentlyFullscreen);

            // If exited fullscreen and video is still playing, pause it
            if (!isCurrentlyFullscreen && isPlaying && videoRef.current) {
                videoRef.current.pause();
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("mozfullscreenchange", handleFullscreenChange);
        document.addEventListener("MSFullscreenChange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
            document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
        };
    }, [isPlaying]);

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="relative w-full bg-black">
                <video
                    ref={videoRef}
                    className="w-full h-full"
                    onPlay={handlePlay}
                    onEnded={handleEnded}
                    autoPlay
                    muted
                >
                    <source src={videoUrl} type="video/mp4" />
                </video>
            </div>
        </div>
    );
};

export default FullscreenVideoPlayer;






// THIS CODE IS FULL SCREEN WITH CROPPING 

// // FullscreenVideoPlayerFill.js
// import { useState, useRef, useEffect } from "react";

// const FullscreenVideoPlayer = ({ videoUrl, nextPage }) => {
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [hasEnded, setHasEnded] = useState(false);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const videoRef = useRef(null);
//     const hasStartedRecording = useRef(false);

//     // Play handler: start recording + request fullscreen on the video element
//     const handlePlay = async () => {
//         setIsPlaying(true);
//         setHasEnded(false);

//         if (!hasStartedRecording.current) {
//             hasStartedRecording.current = true;
//             // your recording start call
//             fetch("http://localhost:8000/start_recordings")
//                 .then((r) => r.json())
//                 .then((data) => console.log("Recording API response:", data))
//                 .catch((err) => console.error("Error starting recording:", err));
//         }

//         // Request fullscreen on the video element itself
//         const vid = videoRef.current;
//         if (vid) {
//             try {
//                 if (vid.requestFullscreen) await vid.requestFullscreen();
//                 else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
//                 else if (vid.mozRequestFullScreen) vid.mozRequestFullScreen();
//                 else if (vid.msRequestFullscreen) vid.msRequestFullscreen();
//                 // setIsFullscreen will be updated by the fullscreenchange listener
//             } catch (err) {
//                 console.warn("Fullscreen request failed:", err);
//             }
//         }
//     };

//     const handleEnded = () => {
//         setIsPlaying(false);
//         setHasEnded(true);

//         // exit fullscreen on end (best-effort)
//         try {
//             if (document.exitFullscreen) document.exitFullscreen();
//             else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
//             else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
//             else if (document.msExitFullscreen) document.msExitFullscreen();
//         } catch (err) {
//             console.warn("Exit fullscreen failed:", err);
//         }
//         setIsFullscreen(false);
//     };

//     // optional: call your start recordings when isPlaying flips on (keeps your previous logic)
//     useEffect(() => {
//         if (isPlaying) {
//             fetch("/start_recordings", { method: "GET" }).catch(() => { });
//         }
//     }, [isPlaying]);

//     // fullscreen change listener (keeps isFullscreen accurate)
//     useEffect(() => {
//         const onFSChange = () => {
//             const fsEl =
//                 document.fullscreenElement ||
//                 document.webkitFullscreenElement ||
//                 document.mozFullScreenElement ||
//                 document.msFullscreenElement ||
//                 null;

//             // mark fullscreen only when the video element is the fullscreen element
//             const isFS = fsEl === videoRef.current;
//             setIsFullscreen(!!isFS);

//             // if user exited fullscreen while playing, pause to avoid continuing audio/video
//             if (!isFS && isPlaying && videoRef.current) {
//                 videoRef.current.pause();
//             }
//         };

//         document.addEventListener("fullscreenchange", onFSChange);
//         document.addEventListener("webkitfullscreenchange", onFSChange);
//         document.addEventListener("mozfullscreenchange", onFSChange);
//         document.addEventListener("MSFullscreenChange", onFSChange);

//         return () => {
//             document.removeEventListener("fullscreenchange", onFSChange);
//             document.removeEventListener("webkitfullscreenchange", onFSChange);
//             document.removeEventListener("mozfullscreenchange", onFSChange);
//             document.removeEventListener("MSFullscreenChange", onFSChange);
//         };
//     }, [isPlaying]);

//     // inject explicit fullscreen CSS so the video absolutely uses the viewport size
//     useEffect(() => {
//         const css = `
//       /* ensure video in fullscreen covers the viewport */
//       video:-webkit-full-screen,
//       video:-moz-full-screen,
//       video:-ms-fullscreen,
//       video:fullscreen {
//         width: 100vw !important;
//         height: 100vh !important;
//         object-fit: cover !important;
//       }

//       /* fallback general rule so inline style is not the only mechanism */
//       video {
//         display: block;
//         background: black;
//       }
//     `;
//         const styleEl = document.createElement("style");
//         styleEl.setAttribute("data-generated-by", "FullscreenVideoPlayer");
//         styleEl.appendChild(document.createTextNode(css));
//         document.head.appendChild(styleEl);

//         return () => {
//             styleEl.remove();
//         };
//     }, []);

//     // inline style: while fullscreen we explicitly set vw/vh + objectFit: cover.
//     // we also apply a tiny scale to make sure browser rounding doesn't reveal 1-2px bars.
//     const videoStyle = isFullscreen
//         ? {
//             width: "100vw",
//             height: "100vh",
//             objectFit: "cover",
//             display: "block",
//             transform: "scale(1.01)", // tiny zoom to hide 1-2px rounding bars (optional)
//         }
//         : {
//             width: "100%",
//             height: "100%",
//             objectFit: "contain",
//             display: "block",
//         };

//     return (
//         <div className="flex flex-col items-center justify-center w-full h-full">
//             <div className="relative w-full h-full bg-black">
//                 <video
//                     ref={videoRef}
//                     style={videoStyle}
//                     className="w-full h-full"
//                     onPlay={handlePlay}
//                     onEnded={handleEnded}
//                     autoPlay
//                     muted
//                     playsInline
//                 >
//                     <source src={videoUrl} type="video/mp4" />
//                     {/* add more <source> tags if you have other formats */}
//                 </video>
//             </div>
//         </div>
//     );
// };

// export default FullscreenVideoPlayer;
