import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";

import { FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "../../config/consentManagement";
import { routes } from "../../router/router";

import logoIgn from "../../img/logo-ign.png";
import logoMinistereTransformation from "../../img/logo-ministere-transformation.png";
import logoMinistereEcologie from "../../img/logo-ministere-ecologie.png";
import logoCnig from "../../img/logo-cnig.png";

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
                <FooterPersonalDataPolicyItem key="footer-personal-data-policy-item" />,
                <FooterConsentManagementItem key="footer-consent-management-item" />,
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
                    {
                        alt: "MINISTÈRE DE LA TRANSITION ÉCOLOGIQUE ET DE LA COHÉSION DES TERRITOIRES",
                        href: "https://www.ecologie.gouv.fr/",
                        imgUrl: logoMinistereEcologie,
                    },
                    {
                        alt: "Conseil National de l'Information Géolocalisée",
                        href: "https://cnig.gouv.fr/",
                        imgUrl: logoCnig,
                    },
                ],
            }}
        />
    );
};

export default AppFooter;
