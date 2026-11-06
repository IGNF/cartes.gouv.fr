import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import UploadDetails from "@/entrepot/pages/data_details/UploadDetails";
import { stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/livraisons/$uploadId/rapport")({
    validateSearch: (search: { datasheetName?: string } & SearchSchemaInput): { datasheetName?: string } => ({
        datasheetName: stringParam(search.datasheetName),
    }),
    staticData: { matomoLabel: "Détails de livraison" },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, uploadId } = Route.useParams();
    return <UploadDetails datastoreId={datastoreId} uploadId={uploadId} />;
}
