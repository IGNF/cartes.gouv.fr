import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { tss } from "tss-react";

import { useTranslation } from "@/i18n";

type ServiceShareUrlCellProps = {
    shareUrl?: string;
    onCopy: () => void;
};

export default function ServiceShareUrlCell({ shareUrl, onCopy }: ServiceShareUrlCellProps) {
    const { t } = useTranslation("ServicesListTabNext");
    const { classes } = useStyles();

    if (!shareUrl) {
        return <span title={t("url.unavailable")}>-</span>;
    }

    return (
        <span className={classes.root}>
            <span className={classes.url} title={shareUrl}>
                {shareUrl}
            </span>
            <Button iconId="ri-file-copy-line" priority="tertiary no outline" size="small" title={t("url.copy")} onClick={() => onCopy()} />
        </span>
    );
}

const useStyles = tss.withName({ ServiceShareUrlCell }).create({
    root: {
        display: "inline-flex",
        alignItems: "center",
        gap: fr.spacing("1v"),
        maxWidth: "100%",
    },
    url: {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontSize: "0.875rem",
    },
});
