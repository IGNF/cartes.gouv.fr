import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";
import { memo } from "react";

import { externalUrls } from "@/router/externalUrls";
import { FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "../../config/consentManagement";

const AppFooter = () => {
    return (
        <Footer
            accessibility="partially compliant"
            accessibilityLinkProps={{
                href: externalUrls.accessibility,
            }}
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            contentDescription="
                Cartes.gouv.fr est le service public des cartes et données du territoire français. Porté par l’IGN et ses partenaires, il offre à tous un accès à la référence de la cartographie publique et permet à chacun de créer, d’héberger et de publier ses propres données et représentations.
            "
            bottomItems={[
                {
                    linkProps: {
                        href: externalUrls.terms_of_service,
                    },
                    text: "Conditions générales d’utilisation",
                },
                <FooterPersonalDataPolicyItem key="footer-personal-data-policy-item" />,
                <FooterConsentManagementItem key="footer-consent-management-item" />,
                // Choix du thème clair/sombre
                headerFooterDisplayItem,
            ]}
            homeLinkProps={{
                href: externalUrls.discover_cartesgouvfr,
                title: "Accueil - cartes.gouv.fr",
            }}
            termsLinkProps={{
                href: externalUrls.legal_notice,
            }}
            websiteMapLinkProps={{
                href: externalUrls.sitemap,
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
