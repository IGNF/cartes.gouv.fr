import { fr } from "@codegouvfr/react-dsfr";
import { PropsWithChildren } from "react";
import { useStyles } from "tss-react";

/** conteneur des sections d’un formulaire de métadonnées : espacement responsive et séparateur entre sections */
export default function MetadataSectionsContainer({ children }: PropsWithChildren) {
    const { css, cx } = useStyles();

    return (
        <div
            className={cx(
                fr.cx("fr-grid-row", "fr-grid-row--gutters"),
                css({
                    ["& > section"]: {
                        padding: `${fr.spacing("6v")} !important`,
                        [fr.breakpoints.up("md")]: {
                            padding: `${fr.spacing("10v")} !important`,
                        },
                    },
                    ["& > section:not(:last-child)"]: {
                        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
                    },
                })
            )}
        >
            {children}
        </div>
    );
}
