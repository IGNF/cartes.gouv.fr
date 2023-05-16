import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import React from "react";

import { routes } from "../../router/router";

const BtnBackToDatastoreList = () => {
    return (
        <Button linkProps={routes.datastore_list().link} className={fr.cx("fr-my-2w")}>
            {"Retour à la liste de mes espaces de travail"}
        </Button>
    );
};

export default BtnBackToDatastoreList;
