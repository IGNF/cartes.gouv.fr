import React, { useContext } from "react";

import AppLayout from "../components/Layout/AppLayout";
import BtnBackToHome from "../components/Utils/BtnBackToHome";
import { defaultNavItems } from "../config/navItems";
import { UserContext } from "../contexts/UserContext";
import functions from "../functions";

const MyAccount = () => {
    const { user } = useContext(UserContext);

    return (
        <AppLayout navItems={defaultNavItems}>
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
                <strong>{"Date d'inscription"}</strong> : {functions.date.format(user.accountCreationDate)}
            </p>
            <p>
                <strong>Identifiant technique</strong> : {user.id}
            </p>

            <BtnBackToHome />
        </AppLayout>
    );
};

export default MyAccount;
