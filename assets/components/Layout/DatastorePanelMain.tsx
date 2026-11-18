import { fr } from "@codegouvfr/react-dsfr";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useChildMatches, useParams, useParentMatches } from "@tanstack/react-router";
import { PropsWithChildren, ReactNode } from "react";

import DatastoreSideMenu from "@/components/Layout/DatastoreSideMenu";
import type { RouteId } from "@/router";
import Main from "./Main";
import SidePanelMain from "./SidePanelMain";

/** panneau « Mes entrepôts » à gauche, contenu à droite */
export default function DatastorePanelMain({ children }: PropsWithChildren) {
    const { datastoreId, communityId } = useParams({ strict: false });
    return (
        <SidePanelMain
            panel={
                <>
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
                </>
            }
        >
            {children}
        </SidePanelMain>
    );
}

const TABS_LAYOUTS = new Set<RouteId>([
    "/_private/tableau-de-bord/entrepots/$datastoreId/_onglets",
    "/_private/tableau-de-bord/communaute/$communityId/_onglets",
]);
const isTabsLayout = (match: { routeId: RouteId }) => TABS_LAYOUTS.has(match.routeId);

/** layout d’onglets parmi les routes enfants : il rend lui-même le refus de droits, sous ses onglets */
export function useTabsLayoutBelow(): boolean {
    return useChildMatches({ select: (matches) => matches.some(isTabsLayout) });
}

/** enveloppe du refus de droits d’une ressource : nue sous les onglets, pleine page sinon */
export function useResourceStateWrapper(): (node: ReactNode) => ReactNode {
    const tabsAbove = useParentMatches({ select: (matches) => matches.some(isTabsLayout) });

    return (node) => (tabsAbove ? node : <Main>{node}</Main>);
}
