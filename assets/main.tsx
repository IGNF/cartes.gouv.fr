import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import React from "react";
import ReactDOM from "react-dom/client";
// import { mountStoreDevtool } from "simple-zustand-devtools";

import App from "@/App";
// import { useApiEspaceCoStore } from "./stores/ApiEspaceCoStore";
// import { useAuthStore } from "./stores/AuthStore";
// import { useSnackbarStore } from "./stores/SnackbarStore";

import "ol/ol.css";

// en prod
if (import.meta.env?.APP_ENV?.toLowerCase() === "prod") {
    disableReactDevTools();
}
// en dev/qualif
else {
    // mountStoreDevtool("AuthStore", useAuthStore);
    // mountStoreDevtool("ApiEspaceCoStore", useApiEspaceCoStore);
    // mountStoreDevtool("SnackbarStore", useSnackbarStore);
}

startReactDsfr({ defaultColorScheme: "light" });

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
