import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { Link, type LinkProps } from "@tanstack/react-router";
import { createHead, UnheadProvider } from "@unhead/react/client";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";

// Enregistrement du Link TanStack auprès de react-dsfr (linkProps={{ to, params }} typés).
// (props: LinkProps) => … et non typeof Link : l'unpacking d'un composant générique retombe sur AnyRouter,
// LinkProps instancie ses génériques par défaut sur RegisteredRouter (pattern documenté par react-dsfr).
declare module "@codegouvfr/react-dsfr/spa" {
    interface RegisterLink {
        Link: (props: LinkProps) => React.JSX.Element;
    }
}

// en prod
if (import.meta.env?.APP_ENV?.toLowerCase() === "prod") {
    disableReactDevTools();
} else {
    document.getElementsByClassName("sf-toolbar")?.[0]?.classList?.remove("sf-display-none");
}

startReactDsfr({ defaultColorScheme: "light", Link });

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
