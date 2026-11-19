import { createFileRoute, notFound } from "@tanstack/react-router";

import ServicePage from "@/entrepot/pages/datasheet/ServicePage/ServicePage";
import { datasheetQueryOptions } from "@/hooks/queries/datasheetQueryOptions";
import { datasheetServiceListQueryOptions } from "@/hooks/queries/datasheetServiceListQueryOptions";
import { serviceQueryOptions } from "@/hooks/queries/serviceQueryOptions";
import { regex } from "@/utils";

export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/flux/$offeringId")({
    staticData: { matomoLabel: "Flux" },
    beforeLoad: ({ params }) => {
        if (!regex.uuid.test(params.offeringId)) throw notFound();
    },
    // lancés sans attente : la page lit les requêtes dans le cache, l’erreur y reste
    loader: ({ context, params }) => {
        void context.queryClient.query(serviceQueryOptions(params.datastoreId, params.offeringId)).catch(() => {});
        void context.queryClient.query(datasheetServiceListQueryOptions(params.datastoreId, params.datasheetName)).catch(() => {});
        void context.queryClient.query(datasheetQueryOptions(params.datastoreId, params.datasheetName)).catch(() => {});
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { datastoreId, datasheetName, offeringId } = Route.useParams();
    return <ServicePage datastoreId={datastoreId} datasheetName={datasheetName} offeringId={offeringId} />;
}
