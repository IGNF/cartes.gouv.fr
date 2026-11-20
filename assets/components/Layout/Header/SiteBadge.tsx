import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useMatches } from "@tanstack/react-router";

import type { RouteId } from "@/router";

// routes (layouts compris : un layout couvre toutes ses feuilles) où le badge « Publier » s’affiche
const PUBLISH_ROUTE_IDS = new Set<RouteId>([
    "/_private/_panneau",
    "/_private/tableau-de-bord/entrepots/$datastoreId",
    "/_private/tableau-de-bord/communaute/$communityId",
    "/_private/configuration/alertes",
    "/_private/tableau-de-bord/",
    "/_private/demande-acces/$fileIdentifier",
    "/_public/publier-une-donnee",
]);

const CONTRIBUTE_ROUTE_IDS = new Set<RouteId>(["/_public/contribuer-aux-donnees", "/_private/espace-collaboratif"]);

export default function SiteBadge() {
    const isPublish = useMatches({ select: (matches) => matches.some((match) => PUBLISH_ROUTE_IDS.has(match.routeId)) });
    const isContribute = useMatches({ select: (matches) => matches.some((match) => CONTRIBUTE_ROUTE_IDS.has(match.routeId)) });

    if (isPublish) {
        return (
            <Badge className={fr.cx("fr-badge--green-archipel")} noIcon={true} as="span" small={true}>
                <span className={fr.cx("fr-icon--sm", "fr-icon-database-line", "fr-mr-1v")} aria-hidden="true" />
                Publier
            </Badge>
        );
    }

    if (isContribute) {
        return (
            <Badge className={fr.cx("fr-badge--green-bourgeon")} noIcon={true} as="span" small={true}>
                <span className={fr.cx("fr-icon--sm", "fr-icon-message-2-fill", "fr-mr-1v")} aria-hidden="true" />
                Contribuer
            </Badge>
        );
    }

    return null;
}
