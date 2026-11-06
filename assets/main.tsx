import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { type LinkProps } from "@tanstack/react-router";
import { createHead, UnheadProvider } from "@unhead/react/client";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import { appRevision, appVersion } from "@/env";
import { $readyLang } from "@/i18n";
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

// premier rendu une fois les traductions chargées : avant, l’en-tête suspend et l’attente s’affiche sans mise en page
function whenTranslationsReady(): Promise<void> {
    return new Promise((resolve) => {
        if ($readyLang.current !== undefined) return resolve();
        const subscription = $readyLang.subscribe((lang) => {
            if (lang === undefined) return;
            subscription.unsubscribe();
            resolve();
        });
    });
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
void whenTranslationsReady().then(() =>
    root.render(
        <React.StrictMode>
            <UnheadProvider value={head}>
                <App />
            </UnheadProvider>
        </React.StrictMode>
    )
);

// Sur main, la CI fournit la révision mais pas de version
const versionLabel = appVersion || "version inconnue";
console.info(appRevision ? `cartes.gouv.fr ${versionLabel} (${appRevision})` : "cartes.gouv.fr version inconnue (build local)");
