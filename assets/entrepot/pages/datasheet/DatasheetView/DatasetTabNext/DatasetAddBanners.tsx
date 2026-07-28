import { fr } from "@codegouvfr/react-dsfr";
import { useStyles } from "tss-react";

import { externalLink } from "@/router/externalUrls";

/** Bandeaux d’information sur les différentes façons d’ajouter des données (cartes.gouv.fr, API, QGIS) */
export default function DatasetAddBanners() {
    const { css, cx } = useStyles();

    const bannerClassName = cx(
        fr.cx("fr-mt-2v", "fr-p-2w"),
        css({
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: fr.spacing("2v"),
            backgroundColor: fr.colors.decisions.background.contrast.info.default,
        })
    );

    const accentClassName = css({
        color: fr.colors.decisions.text.default.info.default,
    });

    const titleClassName = cx(accentClassName, css({ fontWeight: "bold" }));

    return (
        <>
            <div className={bannerClassName}>
                <span className={cx(fr.cx("fr-icon-information-fill", "fr-icon--sm"), accentClassName)} aria-hidden="true" />
                <span className={titleClassName}>Ajouter uniquement vos données vecteur</span>
                <span>Pour ajouter vos données raster</span>
                <a className={fr.cx("fr-link")} {...externalLink("helpProducerGuideCreateDatasheet", "Consulter l’aide")}>
                    Consulter l’aide
                </a>
            </div>
            <div className={bannerClassName}>
                <span className={cx(fr.cx("fr-icon-information-fill", "fr-icon--sm"), accentClassName)} aria-hidden="true" />
                <span className={titleClassName}>Ajouter vos données directement depuis vos outils :</span>
                <a className={fr.cx("fr-link")} {...externalLink("helpDeveloperGuideVectorFeed", "Depuis une API")}>
                    Depuis une API
                </a>
                <a className={fr.cx("fr-link")} {...externalLink("qgisPluginGeoplateforme", "Depuis QGIS")}>
                    Depuis QGIS
                </a>
            </div>
        </>
    );
}
