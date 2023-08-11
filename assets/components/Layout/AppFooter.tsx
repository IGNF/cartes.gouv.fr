import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";

import { routes } from "../../router/router";

import logoIgn from "../../img/logo-ign.png";
import logoMinistereTransformation from "../../img/logo-ministere-transformation.png";

const AppFooter = () => {
    return (
        <Footer
            accessibility="partially compliant"
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
                    text: "Données personnelles",
                    linkProps: routes.personal_data().link,
                },
                // Choix du thème clair/sombre
                headerFooterDisplayItem,
            ]}
            homeLinkProps={{
                ...routes.home().link,
                title: "Accueil - cartes.gouv.fr",
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
