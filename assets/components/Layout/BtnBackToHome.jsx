import Button from "@codegouvfr/react-dsfr/Button";
import React from "react";
import { routes } from "../../router/router";

const BtnBackToHome = () => {
    return <Button linkProps={routes.home().link}>{"Retour à l'accueil"}</Button>;
};

export default BtnBackToHome;
