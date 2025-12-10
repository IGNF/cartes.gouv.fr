import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";
import { memo } from "react";

import { FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "../../config/consentManagement";
import { routes } from "../../router/router";

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
                Cartes.gouv.fr est développé par l’Institut national de l’information géographique et forestière (IGN) et ses partenaires. Le site s’appuie sur la Géoplateforme, la nouvelle infrastructure publique, ouverte et collaborative des données géographiques.
            "
            bottomItems={[
                {
                    linkProps: routes.terms_of_service().link,
                    text: "Conditions générales d’utilisation",
                },
                <FooterPersonalDataPolicyItem key="footer-personal-data-policy-item" />,
                <FooterConsentManagementItem key="footer-consent-management-item" />,
                // Choix du thème clair/sombre
                headerFooterDisplayItem,
            ]}
            homeLinkProps={{
                ...routes.discover().link,
                title: "Accueil - cartes.gouv.fr",
            }}
            termsLinkProps={{
                ...routes.legal_notice().link,
            }}
            websiteMapLinkProps={{
                ...routes.sitemap().link,
            }}
            partnersLogos={{
                main: {
                    alt: "IGN",
                    href: "https://www.ign.fr",
                    imgUrl: "https://data.geopf.fr/annexes/ressources/footer/ign.png",
                },
                sub: [
                    {
                        alt: "MINISTÈRE DE LA TRANSFORMATION ET DE LA FONCTION PUBLIQUES",
                        href: "https://www.transformation.gouv.fr/",
                        imgUrl: "https://data.geopf.fr/annexes/ressources/footer/min_fp.jpg",
                    },
                    {
                        alt: "MINISTÈRE DE LA TRANSITION ÉCOLOGIQUE ET DE LA COHÉSION DES TERRITOIRES",
                        href: "https://www.ecologie.gouv.fr/",
                        imgUrl: "https://data.geopf.fr/annexes/ressources/footer/min_ecologie.jpg",
                    },
                    {
                        alt: "Conseil National de l’Information Géolocalisée",
                        href: "https://cnig.gouv.fr/",
                        imgUrl: "https://data.geopf.fr/annexes/ressources/footer/rf_cnig.jpg",
                    },
                ],
            }}
        />
    );
};

export default memo(AppFooter);
