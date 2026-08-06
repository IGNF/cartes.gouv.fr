import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tableau-de-bord/entrepots/$datastoreId/")({
    component: DatastoreIndexSpike,
});

function DatastoreIndexSpike() {
    const { datastoreId } = Route.useParams();
    return <p>Shell de l’entrepôt {datastoreId} rendu instantanément (aucun fetch).</p>;
}
