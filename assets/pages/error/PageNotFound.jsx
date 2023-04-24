import React from "react";
import { routes } from "../../router";
import Button from "@codegouvfr/react-dsfr/Button";

const PageNotFound = () => {
    return (
        <>
            <h1>404, page non trouvée</h1>
            <Button linkProps={routes.home().link}>Retour à l'accueil</Button>
        </>
    );
};

export default PageNotFound;
