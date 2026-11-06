import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DiscoverPublish from "@/pages/discover/publish/DiscoverPublish";
import { integerParam } from "@/router/searchParams";

export const Route = createFileRoute("/_public/publier-une-donnee")({
    validateSearch: (search: { login_failed?: number } & SearchSchemaInput): { login_failed?: number } => ({
        login_failed: integerParam(search.login_failed),
    }),
    staticData: { matomoLabel: "Publier une donnée" },
    // page d’accueil : rendue sans attendre de chunk, comme avant la bascule
    codeSplitGroupings: [],
    component: RouteComponent,
});

function RouteComponent() {
    return <DiscoverPublish />;
}
