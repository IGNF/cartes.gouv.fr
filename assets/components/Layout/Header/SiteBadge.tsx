import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useMatches } from "@tanstack/react-router";

// routes (layouts compris : un layout couvre toutes ses feuilles) où le badge « Publier » s’affiche
const PUBLISH_ROUTE_IDS = new Set<string>([
    "/_private/_panneau",
    "/_private/tableau-de-bord/entrepots/$datastoreId",
    "/_private/tableau-de-bord/communaute/$communityId",
    "/_private/configuration/alertes",
    "/_private/espace-collaboratif",
    "/_private/tableau-de-bord/",
    "/_private/demande-acces/$fileIdentifier",
    "/_public/publier-une-donnee",
]);

export default function SiteBadge() {
    const isPublish = useMatches({ select: (matches) => matches.some((match) => PUBLISH_ROUTE_IDS.has(match.routeId)) });

    if (!isPublish) {
        return null;
    }

    return (
        <Badge className={fr.cx("fr-badge--green-archipel")} noIcon={true} as="span" small={true}>
            <span className={fr.cx("fr-icon--sm", "fr-icon-database-line", "fr-mr-1v")} aria-hidden="true" />
            Publier
        </Badge>
    );
}
