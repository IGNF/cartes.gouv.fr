import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

import MenuList from "@/components/Utils/MenuList";
import { useTranslation } from "@/i18n";

import placeholder1x1 from "@/img/placeholder.1x1.png";

type DatasheetHeaderProps = {
    name: string;
    thumbnailUrl?: string;
    catalogueUrl?: string;
    published: boolean;
    /** publier exige une fiche de métadonnées */
    canPublish: boolean;
    onPublish: () => void;
    onUnpublish: () => void;
    onDelete: () => void;
};

export default function DatasheetHeader(props: DatasheetHeaderProps) {
    const { name, thumbnailUrl, catalogueUrl, published, canPublish, onPublish, onUnpublish, onDelete } = props;
    const { t } = useTranslation("DatasheetViewNext");
    const { classes, cx } = useStyles();

    return (
        <div className={classes.header}>
            <div className={classes.identity}>
                <img src={thumbnailUrl ?? placeholder1x1} alt={t("thumbnail_alt")} className={classes.thumbnail} />
                <div className={classes.heading}>
                    {/* h4 visuel, h1 dans le code (#1038) */}
                    <h1 className={cx(fr.cx("fr-h4", "fr-m-0"), classes.title)}>{name}</h1>
                    {published && catalogueUrl && (
                        <a
                            href={catalogueUrl}
                            className={fr.cx("fr-link", "fr-link--sm", "fr-link--icon-right", "fr-icon-external-link-line")}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t("catalogue_link")}
                        </a>
                    )}
                </div>
            </div>
            <div className={classes.actions}>
                {published ? (
                    <Badge severity="success" noIcon>
                        {t("published")}
                    </Badge>
                ) : (
                    <>
                        <Badge noIcon>{t("not_published")}</Badge>
                        <Button
                            priority="primary"
                            onClick={() => onPublish()}
                            disabled={!canPublish}
                            title={canPublish ? undefined : t("publish_requires_description")}
                        >
                            {t("publish")}
                        </Button>
                    </>
                )}
                <MenuList
                    menuOpenButtonProps={{ iconId: "ri-more-2-line", priority: "tertiary no outline", title: t("other_actions") }}
                    items={[published && { text: t("unpublish"), onClick: () => onUnpublish() }, { text: t("delete"), onClick: () => onDelete() }]}
                />
            </div>
        </div>
    );
}

const useStyles = tss.withName({ DatasheetHeader }).create({
    header: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: fr.spacing("3w"),
        margin: `${fr.spacing("5w")} 0 ${fr.spacing("3w")}`,
    },
    identity: {
        display: "flex",
        alignItems: "center",
        gap: fr.spacing("2w"),
        flex: 1,
        minWidth: 0,
    },
    thumbnail: {
        width: 72,
        height: 72,
        objectFit: "cover",
        flexShrink: 0,
    },
    heading: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: fr.spacing("1w"),
        minWidth: 0,
    },
    // deux lignes au plus (#1038)
    title: {
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        // seule voie pour line-clamp, malgré la dépréciation dans les types
        // oxlint-disable-next-line typescript/no-deprecated
        WebkitBoxOrient: "vertical",
    },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: fr.spacing("2w"),
        flexShrink: 0,
    },
});
