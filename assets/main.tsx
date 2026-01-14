import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { createHead, UnheadProvider } from "@unhead/react/client";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";

// en prod
if (import.meta.env?.APP_ENV?.toLowerCase() === "prod") {
    disableReactDevTools();
}

startReactDsfr({ defaultColorScheme: "light" });

const head = createHead();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <UnheadProvider head={head}>
            <App />
        </UnheadProvider>
    </React.StrictMode>
);

console.info(`cartes.gouv.fr: ${__GIT_TAG__}`);
