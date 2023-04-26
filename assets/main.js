/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.css in this case)
// import './styles/app.css';

// start the Stimulus application
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

startReactDsfr({ defaultColorScheme: "light" });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
