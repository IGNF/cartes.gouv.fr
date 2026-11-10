import { fr } from "@codegouvfr/react-dsfr";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { tss } from "tss-react";

import { useTranslation } from "@/i18n";
import { externalLink } from "@/router/externalUrls";

/** façons d’ajouter des données : depuis cartes.gouv.fr (vecteur seulement), une API ou QGIS */
export default function DatasetAddBanners() {
    const { t } = useTranslation("DatasetTabNext");
    const { classes, cx } = useStyles();

    return (
        <>
            <Notice
                className={fr.cx("fr-mt-2v")}
                title={t("banner.vector_only")}
                description={
                    <>
                        {t("banner.raster_help")}{" "}
                        <a className={cx(fr.cx("fr-link"), classes.link)} {...externalLink("helpProducerGuideCreateDatasheet", t("banner.help_link"))}>
                            {t("banner.help_link")}
                        </a>
                    </>
                }
            />
            <Notice
                className={fr.cx("fr-mt-2v")}
                title={t("banner.tools")}
                description={
                    <>
                        <a className={cx(fr.cx("fr-link", "fr-mr-2w"), classes.link)} {...externalLink("helpDeveloperGuideVectorFeed", t("banner.api"))}>
                            {t("banner.api")}
                        </a>
                        <a className={cx(fr.cx("fr-link"), classes.link)} {...externalLink("qgisPluginGeoplateforme", t("banner.qgis"))}>
                            {t("banner.qgis")}
                        </a>
                    </>
                }
            />
        </>
    );
}

const useStyles = tss.withName({ DatasetAddBanners }).create({
    // liens de la couleur du bandeau d’information
    link: {
        color: fr.colors.decisions.text.default.info.default,
    },
});
