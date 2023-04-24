import React from "react";

import { routes } from "../router";
import Button from "@codegouvfr/react-dsfr/Button";

const Docs = () => {
    return (
        <div>
            <h1>Docs</h1>

            <Button linkProps={routes.home().link}>Retour à l'accueil</Button>
        </div>
    );
};

export default Docs;
