import { fr } from "@codegouvfr/react-dsfr";

import { externalLink, externalUrls } from "@/router/externalUrls";

export default function NewsletterBanner() {
    return (
        <div className={fr.cx("fr-follow")}>
            <div className={fr.cx("fr-container")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <div className={fr.cx("fr-follow__newsletter")}>
                            <div>
                                <h2 className={fr.cx("fr-h5")}>Inscrivez-vous à notre lettre d’information</h2>
                                <p className={fr.cx("fr-text--sm")}>Retrouvez toutes les actualités directement par courriel chaque trimestre.</p>
                            </div>
                            <div>
                                <a href={externalUrls.newsletterSubscription} className={fr.cx("fr-btn")} id="newsletter-registration">
                                    S’inscrire
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className={fr.cx("fr-col-12", "fr-col-md-6")}>
                        <div className={fr.cx("fr-follow__newsletter")}>
                            <h2 className={fr.cx("fr-h5")}>Communauté</h2>
                            <p className={fr.cx("fr-text--sm")}>
                                Rejoignez la communauté Géoplateforme - cartes.gouv.fr pour suivre les actualités et échanger avec les membres.
                            </p>
                            <a className={fr.cx("fr-link")} {...externalLink("community_geopf_cartesgouvfr_expertises_territoires")}>
                                Rejoindre la communauté
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
