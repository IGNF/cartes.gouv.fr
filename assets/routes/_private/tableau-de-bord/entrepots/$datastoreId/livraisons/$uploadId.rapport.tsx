import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import UploadDetails from "@/entrepot/pages/data_details/UploadDetails";
import { optionalStringParam } from "@/router/searchParams";

type UploadDetailsSearch = {
    datasheetName?: string;
};

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/livraisons/$uploadId/rapport")({
    validateSearch: (search: UploadDetailsSearch & SearchSchemaInput): UploadDetailsSearch => ({
        datasheetName: optionalStringParam(search.datasheetName),
    }),
    component: UploadDetailsRoute,
});

function UploadDetailsRoute() {
    const { datastoreId, uploadId } = Route.useParams();
    return <UploadDetails datastoreId={datastoreId} uploadId={uploadId} />;
}
