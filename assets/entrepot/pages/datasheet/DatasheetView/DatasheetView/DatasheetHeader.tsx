import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

import LoadingText from "@/components/Utils/LoadingText";
import MenuList from "@/components/Utils/MenuList";

import placeholder1x1 from "@/img/placeholder.1x1.png";

type DatasheetHeaderProps = {
    name: string;
    thumbnailUrl?: string;
    catalogLink?: string;
    published?: boolean;
    loading?: boolean;
    onPublish: () => void;
    onUnpublish: () => void;
    onDelete: () => void;
};

export default function DatasheetHeader(props: DatasheetHeaderProps) {
    const { name, thumbnailUrl, catalogLink, published = false, loading = false, onPublish, onUnpublish, onDelete } = props;

    const { classes } = useStyles();

    if (loading) {
        return <LoadingText withSpinnerIcon />;
    }

    return (
        <div className={classes.header}>
            <div className={classes.identity}>
                <img src={thumbnailUrl ?? placeholder1x1} alt="" className={classes.thumbnail} />

                <div className={classes.heading}>
                    <h1 className={fr.cx("fr-h4", "fr-m-0")}>{name}</h1>
                    {published && catalogLink && (
                        <a
                            href={catalogLink}
                            className={fr.cx("fr-link", "fr-link--sm", "fr-link--icon-right", "fr-icon-external-link-line")}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Lien vers le catalogue
                        </a>
                    )}
                </div>
            </div>
            <div className={classes.actions}>
                <Badge severity={published ? "success" : undefined} noIcon>
                    {published ? "Publié" : "Non publié"}
                </Badge>
                {!published && (
                    <Button priority="primary" onClick={onPublish}>
                        Publier
                    </Button>
                )}
                <MenuList
                    menuOpenButtonProps={{
                        iconId: "ri-more-2-line",
                        priority: "tertiary no outline",
                        title: "Autres actions",
                    }}
                    items={[
                        published && {
                            text: "Dépublier",
                            onClick: onUnpublish,
                        },
                        {
                            text: "Supprimer",
                            onClick: onDelete,
                        },
                    ]}
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
        gap: "1.5rem",
        margin: "1.5rem 0",
    },
    identity: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flex: 1,
        minWidth: 0,
    },
    thumbnail: {
        width: 72,
        height: 72,
        borderRadius: 4,
        objectFit: "cover",
        flexShrink: 0,
    },
    heading: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "0.5rem",
        minWidth: 0,

        ["& h1"]: {
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
        },
    },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexShrink: 0,
    },
});
