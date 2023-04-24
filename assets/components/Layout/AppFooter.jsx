import Footer from "@codegouvfr/react-dsfr/Footer";
import React from "react";
import { routes } from "../../router";

const AppFooter = () => {
    return (
        <Footer
            accessibility="fully compliant"
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            contentDescription="
    Ce message est à remplacer par les informations de votre site.

    Comme exemple de contenu, vous pouvez indiquer les informations 
    suivantes : Le site officiel d’information administrative pour les entreprises.
    Retrouvez toutes les informations et démarches administratives nécessaires à la création, 
    à la gestion et au développement de votre entreprise.
    "
            cookiesManagementLinkProps={{
                href: "#",
            }}
            homeLinkProps={{
                ...routes.home().link,
                title: "Accueil - cartes.gouv.fr",
            }}
            personalDataLinkProps={{
                href: "#",
            }}
            termsLinkProps={{
                href: "#",
            }}
            websiteMapLinkProps={{
                href: "#",
            }}
        />
    );
};

export default AppFooter;
