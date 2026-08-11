import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import Stats from "@/entrepot/pages/stats/Stats";
import StatsIndex from "@/entrepot/pages/stats/StatsIndex";
import type { StatsScope } from "@/entrepot/pages/stats/stats.types";

const scopes: readonly StatsScope[] = ["datastore", "user"];

type StatsSearch = {
    scope?: StatsScope;
};

export const Route = createFileRoute("/_private/tableau-de-bord/statistiques-de-consommation")({
    validateSearch: (search: { scope?: string } & SearchSchemaInput): StatsSearch => ({
        scope: scopes.includes(search.scope as StatsScope) ? (search.scope as StatsScope) : undefined,
    }),
    component: StatsPage,
});

// Sans scope : sélection du périmètre ; avec scope : statistiques du périmètre
function StatsPage() {
    const { scope } = Route.useSearch();
    return scope === undefined ? <StatsIndex /> : <Stats scope={scope} />;
}
