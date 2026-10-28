import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import { useStyles } from "tss-react";

type ServiceShareUrlCellProps = {
    shareUrl?: string;
    onCopy: () => void;
};

export default function ServiceShareUrlCell({ shareUrl, onCopy }: ServiceShareUrlCellProps) {
    const { css, cx } = useStyles();

    if (!shareUrl) {
        return <span title="URL de diffusion indisponible">-</span>;
    }

    return (
        <span className={css({ display: "inline-flex", alignItems: "center", gap: fr.spacing("1v"), maxWidth: "100%" })}>
            <span
                className={cx(fr.cx("fr-text--sm", "fr-m-0"), css({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }))}
                title={shareUrl}
            >
                {shareUrl}
            </span>
            <Button iconId="ri-file-copy-line" priority="tertiary no outline" size="small" title="Copier l’URL" onClick={() => onCopy()} />
        </span>
    );
}
