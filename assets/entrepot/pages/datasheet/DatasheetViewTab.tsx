import { fr } from "@codegouvfr/react-dsfr";
import { PropsWithChildren } from "react";
import { useStyles } from "tss-react";

type ContentCardProps = PropsWithChildren<{
    className?: string;
}>;

export default function DatasheetViewTab({ children, className }: ContentCardProps) {
    const { css, cx } = useStyles();

    return (
        <div
            className={cx(
                fr.cx("fr-container", "fr-py-4w"),
                css({
                    backgroundColor: fr.colors.decisions.background.default.grey.default,
                }),
                className
            )}
        >
            {children}
        </div>
    );
}
