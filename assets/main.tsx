import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { createHead, UnheadProvider } from "@unhead/react/client";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";

// Contourne la barre d'outils Symfony masquée au chargement en dev (élément absent en prod)
document.getElementsByClassName("sf-toolbar")?.[0]?.classList?.remove("sf-display-none");

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

console.info(__APP_REVISION__ ? `cartes.gouv.fr ${__APP_VERSION__} (${__APP_REVISION__})` : "cartes.gouv.fr version inconnue (build local)");
