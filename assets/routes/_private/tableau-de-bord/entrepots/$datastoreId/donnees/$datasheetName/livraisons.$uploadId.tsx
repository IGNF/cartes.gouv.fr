import { createFileRoute, notFound } from "@tanstack/react-router";

import UploadDetailsPage from "@/entrepot/pages/datasheet/DataDetails/UploadDetailsPage";
import { uploadDetailsQueryOptions } from "@/hooks/queries/dataDetailsQueryOptions";
import { regex } from "@/utils";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/livraisons/$uploadId")({
    staticData: { matomoLabel: "Détails de livraison" },
    beforeLoad: ({ params }) => {
        if (!regex.uuid.test(params.uploadId)) throw notFound();
    },
    // lancé sans attente : la page lit la requête dans le cache, l’erreur y reste
    loader: ({ context, params }) => {
        void context.queryClient.query(uploadDetailsQueryOptions(params.datastoreId, params.uploadId)).catch(() => {});
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName, uploadId } = Route.useParams();
    return <UploadDetailsPage datastoreId={datastoreId} datasheetName={datasheetName} uploadId={uploadId} />;
}
