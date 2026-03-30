import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
import { createHead, UnheadProvider } from "@unhead/react/client";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";
import { readBootstrapUser } from "@/modules/bootstrapUser";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/reactQuery";

// en prod
if (import.meta.env?.APP_ENV?.toLowerCase() === "prod") {
    disableReactDevTools();
} else {
    document.getElementsByClassName("sf-toolbar")?.[0]?.classList?.remove("sf-display-none");
}

startReactDsfr({ defaultColorScheme: "light" });

const head = createHead();

queryClient.setQueryData(RQKeys.user_me(), readBootstrapUser());

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <UnheadProvider head={head}>
            <App />
        </UnheadProvider>
    </React.StrictMode>
);

console.info(`cartes.gouv.fr: ${__GIT_TAG__}`);
