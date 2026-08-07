import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useMatches } from "@tanstack/react-router";

// Ids de routes (layouts de sous-arbres inclus : un layout matché couvre toutes ses feuilles) où le badge « Publier » s'affiche
const BADGE_ROUTE_IDS: string[] = [
    "/_private/tableau-de-bord/entrepots/$datastoreId",
    "/_private/tableau-de-bord/communaute/$communityId",
    "/_private/configuration/alertes",
    "/_private/espace-collaboratif",
    "/_private/tableau-de-bord/",
    "/_private/tableau-de-bord/entrepots/",
    "/_private/tableau-de-bord/entrepots/demande-de-creation",
    "/_private/rejoindre-des-communautes",
    "/_private/demande-acces/$fileIdentifier",
    "/_public/publier-une-donnee",
];

export default function SiteBadge() {
    const matches = useMatches();

    if (matches.some((match) => BADGE_ROUTE_IDS.includes(match.routeId))) {
        return (
            <Badge className={fr.cx("fr-badge--green-archipel")} noIcon={true} as="span" small={true}>
                <span className={fr.cx("fr-icon--sm", "fr-icon-database-line", "fr-mr-1v")} />
                Publier
            </Badge>
        );
    }

    return null;
}
