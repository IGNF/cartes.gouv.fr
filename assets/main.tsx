import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

startReactDsfr({ defaultColorScheme: "light" });

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
