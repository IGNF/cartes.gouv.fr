import { fr } from "@codegouvfr/react-dsfr";
import Notice from "@codegouvfr/react-dsfr/Notice";
import { Link } from "@tanstack/react-router";
import { tss } from "tss-react";

import { useTranslation } from "@/i18n";
import { externalLink } from "@/router/externalUrls";

type PyramidNoticeProps = {
    datastoreId: string;
    datasheetName: string;
    /** type de flux nommé dans le texte (WMS, WMTS, TMS) */
    service: string;
    kind: "raster" | "vector";
    /** droits de génération d’une pyramide de ce type : sinon, seul le lien d’aide reste */
    canGenerate: boolean;
};

/** encadré WMS, WMTS et TMS : le flux part d’une pyramide, à générer si la fiche n’en a pas */
export default function PyramidNotice({ datastoreId, datasheetName, service, kind, canGenerate }: PyramidNoticeProps) {
    const { t } = useTranslation("ServiceForm");
    const { classes, cx } = useStyles();

    return (
        <Notice
            className={fr.cx("fr-mb-3w")}
            title={t(`pyramid.notice.title.${kind}`, { service })}
            description={
                <>
                    {t("pyramid.notice.description", { service })}
                    <br />
                    {canGenerate && (
                        <Link
                            className={cx(fr.cx("fr-link", "fr-link--icon-right", "fr-icon-arrow-right-line", "fr-mr-2w"), classes.link)}
                            to={
                                kind === "raster"
                                    ? "/tableau-de-bord/entrepots/$datastoreId/pyramide-raster/ajout"
                                    : "/tableau-de-bord/entrepots/$datastoreId/pyramide-vecteur/ajout"
                            }
                            params={{ datastoreId }}
                            search={{ datasheetName }}
                        >
                            {t("pyramid.notice.generate")}
                        </Link>
                    )}
                    <a
                        className={cx(fr.cx("fr-link", "fr-link--icon-right", "fr-icon-arrow-right-line"), classes.link)}
                        {...externalLink("helpProducerGuide", t("pyramid.notice.help"))}
                    >
                        {t("pyramid.notice.help")}
                    </a>
                </>
            }
        />
    );
}

const useStyles = tss.withName({ PyramidNotice }).create({
    // liens de la couleur du bandeau d’information
    link: {
        color: fr.colors.decisions.text.default.info.default,
    },
});
