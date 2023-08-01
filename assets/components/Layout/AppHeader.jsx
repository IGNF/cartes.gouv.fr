import { fr } from "@codegouvfr/react-dsfr";
import Header from "@codegouvfr/react-dsfr/Header";
import Routing from "fos-router";
import React from "react";

import useUser from "../../hooks/useUser";
import { routes } from "../../router/router";

import PropTypes from "prop-types";

const AppHeader = ({ navItems = [] }) => {
    const { user } = useUser();

    const quickAccessItems = [];

    quickAccessItems.push({
        iconId: fr.cx("fr-icon-arrow-right-line"),
        linkProps: {
            href: "https://geoportail.gouv.fr/carte",
            className: "fr-btn--icon-right",
        },
        text: "Accéder au Géoportail",
    });

    if (user === null) {
        // utilisateur n'est pas connecté
        quickAccessItems.push({
            iconId: fr.cx("fr-icon-account-line"),
            linkProps: {
                href: Routing.generate("cartesgouvfr_security_login"),
            },
            text: "Se connecter",
        });
    } else {
        // utilisateur est connecté
        let btnMyAccountText = `${user.firstName} ${user.lastName}`;
        if (btnMyAccountText.replace(/\s+/g, "") === "") {
            btnMyAccountText = "Mon compte";
        }

        quickAccessItems.push({
            iconId: fr.cx("fr-icon-account-line"),
            linkProps: routes.dashboard_pro().link,
            text: btnMyAccountText,
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
            // renderSearchInput={({ className, id, name, placeholder, type }) => (
            //     <input className={className} id={id} name={name} placeholder={placeholder} type={type} />
            // )}
            navigation={navItems}
        />
    );
};

AppHeader.propTypes = {
    navItems: PropTypes.array,
};

export default AppHeader;
