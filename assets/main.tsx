import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

if ((document.getElementById("root") as HTMLDivElement)?.dataset?.appEnv === "prod") {
    disableReactDevTools();
}

startReactDsfr({ defaultColorScheme: "light" });

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
