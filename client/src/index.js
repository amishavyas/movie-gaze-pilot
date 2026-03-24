import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Experiment from "./components/Experiment";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <CssBaseline />
            <Experiment />
        </BrowserRouter>
    </React.StrictMode>
);