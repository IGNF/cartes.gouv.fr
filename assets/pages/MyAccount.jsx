import Button from "@codegouvfr/react-dsfr/Button";
import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import functions from "../functions";
import { routes } from "../router";

const MyAccount = () => {
    const { user } = useContext(UserContext);

    return (
        <>
            <h1>Mon compte</h1>
            <p>
                <strong>Prénom</strong> : {user.firstName}
            </p>
            <p>
                <strong>Nom</strong> : {user.lastName}
            </p>
            <p>
                <strong>Email</strong> : {user.email}
            </p>
            <p>
                <strong>Date d'inscription</strong> : {functions.date.format(user.accountCreationDate)}
            </p>
            <p>
                <strong>Identifiant technique</strong> : {user.id}
            </p>

            <Button linkProps={routes.home().link}>Retour à l'accueil</Button>
        </>
    );
};

export default MyAccount;
