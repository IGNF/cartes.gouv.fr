import Footer from "@codegouvfr/react-dsfr/Footer";
import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import React from "react";
import { routes } from "../../router/router";

import logoIgn from "../../img/logo-ign.png";
import logoMinistereTransformation from "../../img/logo-ministere-transformation.png";

const AppFooter = () => {
    return (
        <Footer
            accessibility="non compliant"
            accessibilityLinkProps={{
                ...routes.accessibility().link,
            }}
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            contentDescription="
                Cartes.gouv.fr propose des services développés par l’Institut national de 
                l’information géographique et forestière (IGN) et ses partenaires, ils sont 
                alimentés par la Géoplateforme, la nouvelle infrastructure publique des données 
                géographiques.
            "
            bottomItems={[
                {
                    text: "données personnelles",
                    linkProps: routes.personal_data().link
                },
                // Choix du thème clair/sombre
                headerFooterDisplayItem
            ]}
            cookiesManagementLinkProps={{
                ...routes.cookies().link,
            }}
            homeLinkProps={{
                ...routes.home().link,
                title: "Accueil - cartes.gouv.fr",
            }}
            personalDataLinkProps={{
                ...routes.personal_data().link,
            }}
            termsLinkProps={{
                ...routes.legal_notice().link,
            }}
            websiteMapLinkProps={{
                ...routes.sitemap().link,
            }}
            partnersLogos={{
                sub: [
                    {
                        alt: "IGN",
                        href: "https://www.ign.fr",
                        imgUrl: logoIgn,
                    },
                    {
                        alt: "MINISTÈRE DE LA TRANSFORMATION ET DE LA FONCTION PUBLIQUES",
                        href: "https://www.transformation.gouv.fr/",
                        imgUrl: logoMinistereTransformation,
                    },
                ],
            }}
        />
    );
};

export default AppFooter;
