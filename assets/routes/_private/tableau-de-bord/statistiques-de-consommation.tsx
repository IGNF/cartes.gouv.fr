import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import Stats from "@/entrepot/pages/stats/Stats";
import StatsIndex from "@/entrepot/pages/stats/StatsIndex";
import { statsScopes, type StatsScope } from "@/entrepot/pages/stats/stats.types";
import { enumParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/statistiques-de-consommation")({
    validateSearch: (search: { scope?: StatsScope | undefined } & SearchSchemaInput): { scope: StatsScope | undefined } => ({
        scope: enumParam(search.scope, statsScopes) ?? undefined,
    }),
    staticData: { matomoLabel: "Statistiques de consommation" },
    component: RouteComponent,
});

function RouteComponent() {
    // sans périmètre : choix du périmètre
    const { scope } = Route.useSearch();
    return scope === undefined ? <StatsIndex /> : <Stats />;
}
