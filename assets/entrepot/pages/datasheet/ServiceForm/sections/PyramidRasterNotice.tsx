import { fr } from "@codegouvfr/react-dsfr";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { Link } from "@tanstack/react-router";
import { tss } from "tss-react";

import { useTranslation } from "@/i18n";
import { externalLink } from "@/router/externalUrls";

type PyramidRasterNoticeProps = {
    datastoreId: string;
    datasheetName: string;
    /** type de flux nommé dans le texte (WMS, WMTS) */
    service: string;
    /** droits de génération d’une pyramide raster : sinon, seul le lien d’aide reste */
    canGenerate: boolean;
};

/** encadré WMS et WMTS : un flux raster part d’une pyramide raster, à générer si la fiche n’en a pas */
export default function PyramidRasterNotice({ datastoreId, datasheetName, service, canGenerate }: PyramidRasterNoticeProps) {
    const { t } = useTranslation("ServiceForm");
    const { classes, cx } = useStyles();

    return (
        <Notice
            className={fr.cx("fr-mb-3w")}
            title={t("pyramid_raster.notice.title", { service })}
            description={
                <>
                    {t("pyramid_raster.notice.description", { service })}
                    <br />
                    {canGenerate && (
                        <Link
                            className={cx(fr.cx("fr-link", "fr-link--icon-right", "fr-icon-arrow-right-line", "fr-mr-2w"), classes.link)}
                            to="/tableau-de-bord/entrepots/$datastoreId/pyramide-raster/ajout"
                            params={{ datastoreId }}
                            search={{ datasheetName }}
                        >
                            {t("pyramid_raster.notice.generate")}
                        </Link>
                    )}
                    <a
                        className={cx(fr.cx("fr-link", "fr-link--icon-right", "fr-icon-arrow-right-line"), classes.link)}
                        {...externalLink("helpProducerGuide", t("pyramid_raster.notice.help"))}
                    >
                        {t("pyramid_raster.notice.help")}
                    </a>
                </>
            }
        />
    );
}

const useStyles = tss.withName({ PyramidRasterNotice }).create({
    // liens de la couleur du bandeau d’information
    link: {
        color: fr.colors.decisions.text.default.info.default,
    },
});
