import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
import { mountStoreDevtool } from "simple-zustand-devtools";

import App from "./App";
import { useAuthStore } from "./stores/AuthStore";

// en prod
if ((document.getElementById("root") as HTMLDivElement)?.dataset?.appEnv?.toLowerCase() === "prod") {
    disableReactDevTools();
}
// en dev/qualif
else {
    mountStoreDevtool("AuthStore", useAuthStore);
}

startReactDsfr({ defaultColorScheme: "light" });

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
