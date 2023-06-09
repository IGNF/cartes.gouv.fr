import Footer from "@codegouvfr/react-dsfr/Footer";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import React from "react";
import { routes } from "../../router/router";

const AppFooter = () => {
    return (
        <Footer
            accessibility="non compliant"
            accessibilityLinkProps={{
                ...routes.accessibility().link
            }}
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            contentDescription="
            Texte optionnel 3 lignes maximum.

            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Consectetur et vel quam auctor semper. Cras si amet mollis dolor. 
            "
            cookiesManagementLinkProps={{
                ...routes.cookies().link
            }}
            homeLinkProps={{
                ...routes.home().link,
                title: "Accueil - cartes.gouv.fr",
            }}
            personalDataLinkProps={{
                ...routes.personal_data().link
            }}
            termsLinkProps={{
                ...routes.legal_notice().link
            }}
            websiteMapLinkProps={{
                ...routes.sitemap().link
            }}
            bottomItems={[
                headerFooterDisplayItem
            ]}
        />
    );
};

export default AppFooter;
