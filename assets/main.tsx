import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { type LinkProps } from "@tanstack/react-router";
import { createHead, UnheadProvider } from "@unhead/react/client";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import { appRevision, appVersion } from "@/env";
import { analyticsInit } from "@/modules/analytics";
import AppLink from "@/router/AppLink";

// signature explicite et non typeof AppLink : un composant générique déballé retombe sur AnyRouter
declare module "@codegouvfr/react-dsfr/spa" {
    interface RegisterLink {
        Link: (props: LinkProps & { href?: string }) => React.JSX.Element;
    }
}

// Contourne la barre d'outils Symfony masquée au chargement en dev (élément absent en prod)
document.getElementsByClassName("sf-toolbar")?.[0]?.classList?.remove("sf-display-none");

startReactDsfr({ defaultColorScheme: "light", Link: AppLink });

const head = createHead();

void analyticsInit();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <UnheadProvider value={head}>
            <App />
        </UnheadProvider>
    </React.StrictMode>
);

// Sur main, la CI fournit la révision mais pas de version
const versionLabel = appVersion || "version inconnue";
console.info(appRevision ? `cartes.gouv.fr ${versionLabel} (${appRevision})` : "cartes.gouv.fr version inconnue (build local)");
