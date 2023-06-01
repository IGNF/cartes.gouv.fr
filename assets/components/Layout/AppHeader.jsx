import { fr } from "@codegouvfr/react-dsfr";
import Header from "@codegouvfr/react-dsfr/Header";
import React, { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import { routes } from "../../router/router";

import PropTypes from "prop-types";

const AppHeader = ({ navItems = [] }) => {
    const { user } = useContext(UserContext);

    const quickAccessItems = [];

    if (user == null) {
        // utilisateur n'est pas connecté
        quickAccessItems.push({
            iconId: "fr-icon-lock-line",
            linkProps: {
                href: Routing.generate("cartesgouvfr_security_login"),
            },
            text: "Se connecter",
        });
        quickAccessItems.push({
            iconId: "fr-icon-account-line",
            linkProps: {
                href: Routing.generate("cartesgouvfr_security_signup"),
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
                href: Routing.generate("cartesgouvfr_security_logout"),
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

AppHeader.propTypes = {
    navItems: PropTypes.array,
};

export default AppHeader;
