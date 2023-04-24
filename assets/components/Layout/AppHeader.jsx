import { fr } from "@codegouvfr/react-dsfr";
import Header from "@codegouvfr/react-dsfr/Header";
import React, { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { routes } from "../../router";

const AppHeader = () => {
    const { user } = useContext(UserContext);

    const navItems = [
        {
            text: "Comment ça marche ?",
            linkProps: routes.docs().link,
        },
        {
            text: "Qu'est-ce qu'un flux de tuiles vectorielles ?",
            linkProps: routes.docs().link,
        },
        {
            text: "Plugin Géotuileur",
            linkProps: {
                href: "/plugin-qgis",
            },
        },
        {
            text: "À propos",
            linkProps: {
                href: "https://www.ign.fr/geoplateforme/la-geoplateforme-en-bref",
                target: "_blank",
                rel: "noopener",
            },
        },
    ];

    const quickAccessItems = [];

    if (user == null) {
        // utilisateur n'est pas connecté
        quickAccessItems.push({
            iconId: "fr-icon-lock-line",
            linkProps: {
                href: "/login",
            },
            text: "Se connecter",
        });
        quickAccessItems.push({
            iconId: "fr-icon-account-line",
            linkProps: {
                href: "/signup",
                disabled: true,
            },
            text: "S’enregistrer",
        });
    } else {
        // utilisateur est connecté
        quickAccessItems.push({
            iconId: fr.cx("fr-icon-account-line"),
            linkProps: routes.my_account().link,
            text: "Mon compte",
        });
        quickAccessItems.push({
            iconId: fr.cx("fr-icon-logout-box-r-line"),
            linkProps: {
                href: "/logout",
            },
            text: "Se déconnecter",
        });
    }

    return (
        <Header
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            homeLinkProps={{
                ...routes.home().link,
                title: "Accueil - cartes.gouv.fr",
            }}
            serviceTitle="cartes.gouv.fr"
            quickAccessItems={quickAccessItems}
            navigation={navItems}
        />
    );
};

export default AppHeader;
