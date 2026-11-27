import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { PropsWithChildren, ReactNode } from "react";
import { tss } from "tss-react";

import useBreadcrumb from "@/hooks/useBreadcrumb";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";

type SidePanelMainProps = PropsWithChildren<{
    panel: ReactNode;
}>;

/** panneau à gauche, colonne de contenu à droite (fil d’Ariane, alerte de session, enfants) */
export default function SidePanelMain({ panel, children }: SidePanelMainProps) {
    const breadcrumbProps = useBreadcrumb();

    const { classes } = useStyles();

    return (
        <main id="main" role="main">
            <div className={fr.cx("fr-container")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={cx(fr.cx("fr-col-12", "fr-col-md-3"), classes.sideMenuCol)}>{panel}</div>
                    <div className={cx(fr.cx("fr-col-12", "fr-col-md-9"), classes.content)}>
                        {breadcrumbProps && <Breadcrumb {...breadcrumbProps} />}
                        <SessionExpiredAlert />
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}

const useStyles = tss.withName({ SidePanelMain }).create({
    sideMenuCol: {
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("10v"),
        borderRight: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
    },
    content: {
        padding: "0 1rem",
    },
});
