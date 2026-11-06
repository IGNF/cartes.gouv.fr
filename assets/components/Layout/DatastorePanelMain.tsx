import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useChildMatches, useParams, useParentMatches } from "@tanstack/react-router";
import { PropsWithChildren, ReactNode } from "react";
import { tss } from "tss-react";

import DatastoreSideMenu from "@/components/Layout/DatastoreSideMenu";
import useBreadcrumb from "@/hooks/useBreadcrumb";
import { routes } from "@/router/router";
import SessionExpiredAlert from "../Utils/SessionExpiredAlert";
import Main from "./Main";

/** panneau « Mes entrepôts » à gauche, colonne de contenu à droite (fil d’Ariane, alerte de session, enfants) */
export default function DatastorePanelMain({ children }: PropsWithChildren) {
    const { datastoreId, communityId } = useParams({ strict: false });
    const breadcrumbProps = useBreadcrumb();

    const { classes } = useStyles();

    return (
        <main id="main" role="main">
            <div className={fr.cx("fr-container")}>
                <div className={fr.cx("fr-grid-row")}>
                    <div className={cx(fr.cx("fr-col-12", "fr-col-md-3"), classes.sideMenuCol)}>
                        <DatastoreSideMenu datastoreId={datastoreId} communityId={typeof communityId === "string" ? communityId : undefined} />

                        <ButtonsGroup
                            className={fr.cx("fr-mb-md-6v", "fr-mr-md-8v")}
                            buttons={[
                                {
                                    children: "Ajouter un entrepôt",
                                    linkProps: routes.datastore_create_request().link,
                                    priority: "secondary",
                                },
                            ]}
                        />
                    </div>
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

const isTabsLayout = (match: { routeId: string }) => match.routeId.endsWith("/_onglets");

/**
 * Enveloppe des états d’attente et de refus d’un layout de ressource : dans le panneau si les onglets sont dessous,
 * nue si le panneau est déjà au-dessus, pleine page sinon.
 */
export function useResourceStateWrapper(): (node: ReactNode) => ReactNode {
    const tabsBelow = useChildMatches({ select: (matches) => matches.some(isTabsLayout) });
    const tabsAbove = useParentMatches({ select: (matches) => matches.some(isTabsLayout) });

    return (node) => (tabsBelow ? <DatastorePanelMain>{node}</DatastorePanelMain> : tabsAbove ? node : <Main>{node}</Main>);
}

const useStyles = tss.withName({ DatastorePanelMain }).create({
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
