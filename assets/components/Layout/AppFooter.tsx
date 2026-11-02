import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer, { FooterProps } from "@codegouvfr/react-dsfr/Footer";
import { memo } from "react";

import { externalUrls } from "@/router/externalUrls";

// Le nom du partenaire sert de texte alternatif au logo et de titre au lien
const partnerLogo = (name: string, href: string, imgFile: string): FooterProps.PartnersLogos.Logo => ({
    alt: name,
    imgUrl: `https://data.geopf.fr/annexes/ressources/footer/${imgFile}`,
    linkProps: { href, title: name },
});

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
                {
                    linkProps: {
                        href: externalUrls.personal_data,
                    },
                    text: "Données personnelles",
                },
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
                main: partnerLogo("Institut national de l’information géographique et forestière", "https://www.ign.fr", "ign.png"),
                sub: [
                    partnerLogo("Ministère de la Transformation et de la Fonction publiques", "https://www.transformation.gouv.fr/", "min_fp.jpg"),
                    partnerLogo("Ministère de la Transition écologique et de la Cohésion des territoires", "https://www.ecologie.gouv.fr/", "min_ecologie.jpg"),
                    partnerLogo("Conseil national de l’information géolocalisée", "https://cnig.gouv.fr/", "rf_cnig.jpg"),
                ],
            }}
        />
    );
};

export default memo(AppFooter);
