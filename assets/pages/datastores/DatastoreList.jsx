import Button from "@codegouvfr/react-dsfr/Button";
import React from "react";
import { routes } from "../../router";

const DatastoreList = () => {
    return (
        <>
            <h1>Mes espaces de travail</h1>
            <Button linkProps={routes.home().link}>Retour à l'accueil</Button>
        </>
    );
};

export default DatastoreList;
