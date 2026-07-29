import { fr } from "@codegouvfr/react-dsfr";
import Notice from "@codegouvfr/react-dsfr/Notice";

import { externalLink } from "@/router/externalUrls";

/** Bandeaux d’information sur les différentes façons d’ajouter des données (cartes.gouv.fr, API, QGIS) */
export default function DatasetAddBanners() {
    return (
        <>
            <Notice
                className={fr.cx("fr-mt-2v")}
                title="Ajouter uniquement vos données vecteur"
                description={
                    <>
                        {"Pour ajouter vos données raster "}
                        <a className={fr.cx("fr-link")} {...externalLink("helpProducerGuideCreateDatasheet", "Consulter l’aide")}>
                            Consulter l’aide
                        </a>
                    </>
                }
            />
            <Notice
                className={fr.cx("fr-mt-2v")}
                title="Ajouter vos données directement depuis vos outils :"
                description={
                    <>
                        <a className={fr.cx("fr-link", "fr-mr-2w")} {...externalLink("helpDeveloperGuideVectorFeed", "Depuis une API")}>
                            Depuis une API
                        </a>
                        <a className={fr.cx("fr-link")} {...externalLink("qgisPluginGeoplateforme", "Depuis QGIS")}>
                            Depuis QGIS
                        </a>
                    </>
                }
            />
        </>
    );
}
