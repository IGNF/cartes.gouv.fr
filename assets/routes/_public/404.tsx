import { createFileRoute } from "@tanstack/react-router";

import PageNotFound from "@/pages/error/PageNotFound";

export const Route = createFileRoute("/_public/404")({
    staticData: { matomoLabel: "Page introuvable" },
    component: RouteComponent,
});

function RouteComponent() {
    return <PageNotFound />;
}
