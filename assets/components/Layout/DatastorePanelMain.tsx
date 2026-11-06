import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { useChildMatches, useParams, useParentMatches } from "@tanstack/react-router";
import { PropsWithChildren, ReactNode } from "react";
import { tss } from "tss-react";

import DatastoreSideMenu from "@/components/Layout/DatastoreSideMenu";
import useBreadcrumb from "@/hooks/useBreadcrumb";
import type { RouteId } from "@/router";
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
                                    linkProps: { to: "/tableau-de-bord/entrepots/demande-de-creation" },
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

const TABS_LAYOUTS = new Set<RouteId>([
    "/_private/tableau-de-bord/entrepots/$datastoreId/_onglets",
    "/_private/tableau-de-bord/communaute/$communityId/_onglets",
]);
const isTabsLayout = (match: { routeId: RouteId }) => TABS_LAYOUTS.has(match.routeId);

/**
 * Enveloppe des états d’attente et de refus d’un layout de ressource : dans le panneau si les onglets sont dessous,
 * nue si le panneau est déjà au-dessus, pleine page sinon.
 */
/** layout d’onglets parmi les routes enfants : il rend lui-même le refus de droits, sous ses onglets */
export function useTabsLayoutBelow(): boolean {
    return useChildMatches({ select: (matches) => matches.some(isTabsLayout) });
}

export function useResourceStateWrapper(): (node: ReactNode) => ReactNode {
    const tabsBelow = useTabsLayoutBelow();
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
