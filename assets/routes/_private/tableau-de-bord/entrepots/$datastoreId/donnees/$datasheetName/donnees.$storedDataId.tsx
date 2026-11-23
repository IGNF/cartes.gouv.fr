import { createFileRoute, notFound } from "@tanstack/react-router";

import StoredDataDetailsPage from "@/entrepot/pages/datasheet/DataDetails/StoredDataDetailsPage";
import { storedDataDetailsQueryOptions } from "@/hooks/queries/dataDetailsQueryOptions";
import { regex } from "@/utils";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/donnees/$storedDataId")({
    staticData: { matomoLabel: "Détails de donnée stockée" },
    beforeLoad: ({ params }) => {
        if (!regex.uuid.test(params.storedDataId)) throw notFound();
    },
    // lancé sans attente : la page lit la requête dans le cache, l’erreur y reste
    loader: ({ context, params }) => {
        void context.queryClient.query(storedDataDetailsQueryOptions(params.datastoreId, params.storedDataId)).catch(() => {});
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName, storedDataId } = Route.useParams();
    return <StoredDataDetailsPage datastoreId={datastoreId} datasheetName={datasheetName} storedDataId={storedDataId} />;
}
