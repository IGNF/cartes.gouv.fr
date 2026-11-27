import { fr } from "@codegouvfr/react-dsfr";
import { PropsWithChildren } from "react";
import { tss } from "tss-react";

/** carte blanche d’un onglet de la fiche de données, posée sur le fond gris */
export default function DatasheetViewTab({ children }: PropsWithChildren) {
    const { classes, cx } = useStyles();

    return <div className={cx(fr.cx("fr-p-4w"), classes.root)}>{children}</div>;
}

const useStyles = tss.withName({ DatasheetViewTab }).create({
    root: {
        backgroundColor: fr.colors.decisions.background.default.grey.default,
    },
});
