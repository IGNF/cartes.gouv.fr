import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";
import { memo } from "react";

import { FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "../../config/consentManagement";
import { routes } from "../../router/router";

import logoIgn from "../../img/partners-logos/logo-ign.png";
import logoMinistereTransformation from "../../img/partners-logos/logo-ministere-transformation.jpg";
import logoMinistereEcologie from "../../img/partners-logos/logo-ministere-ecologie.jpg";
import logoCnig from "../../img/partners-logos/logo-rf-cnig.jpg";

const AppFooter = () => {
    return (
        <Footer
            accessibility="partially compliant"
            accessibilityLinkProps={{
                ...routes.accessibility().link,
                id: "footer-accessibility-link",
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
                    linkProps: {
                        ...routes.terms_of_service().link,
                        id: "footer-terms-of-service-link",
                    },
                    text: "Conditions générales d’utilisation",
                },
                <FooterPersonalDataPolicyItem key="footer-personal-data-policy-item" />,
                <FooterConsentManagementItem key="footer-consent-management-item" />,
                // Choix du thème clair/sombre
                headerFooterDisplayItem,
            ]}
            homeLinkProps={{
                ...routes.home().link,
                title: "Accueil - cartes.gouv.fr",
                id: "footer-home-link",
            }}
            termsLinkProps={{
                ...routes.legal_notice().link,
                id: "footer-legal-notice-link",
            }}
            websiteMapLinkProps={{
                ...routes.sitemap().link,
                id: "footer-sitemap-link",
            }}
            partnersLogos={{
                sub: [
                    {
                        alt: "IGN",
                        imgUrl: logoIgn,
                        linkProps: {
                            id: "footer-ign-link",
                            title: "IGN",
                            href: "https://www.ign.fr",
                        },
                    },
                    {
                        alt: "MINISTÈRE DE LA TRANSFORMATION ET DE LA FONCTION PUBLIQUES",
                        imgUrl: logoMinistereTransformation,
                        linkProps: {
                            id: "footer-ministere-transformation-link",
                            title: "MINISTÈRE DE LA TRANSFORMATION ET DE LA FONCTION PUBLIQUES",
                            href: "https://www.transformation.gouv.fr/",
                        },
                    },
                    {
                        alt: "MINISTÈRE DE LA TRANSITION ÉCOLOGIQUE ET DE LA COHÉSION DES TERRITOIRES",
                        imgUrl: logoMinistereEcologie,
                        linkProps: {
                            id: "footer-ministere-ecologie-link",
                            title: "MINISTÈRE DE LA TRANSITION ÉCOLOGIQUE ET DE LA COHÉSION DES TERRITOIRES",
                            href: "https://www.ecologie.gouv.fr/",
                        },
                    },
                    {
                        alt: "Conseil National de l’Information Géolocalisée",
                        imgUrl: logoCnig,
                        linkProps: {
                            id: "footer-cnig-link",
                            title: "Conseil National de l’Information Géolocalisée",
                            href: "https://cnig.gouv.fr/",
                        },
                    },
                ],
            }}
        />
    );
};

export default memo(AppFooter);
