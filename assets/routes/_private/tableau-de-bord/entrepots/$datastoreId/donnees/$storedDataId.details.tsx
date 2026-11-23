import { createFileRoute, notFound, redirect, SearchSchemaInput } from "@tanstack/react-router";

import { stringParam } from "@/router/searchParams";

// ancienne adresse, encore présente dans les e-mails de fin de traitement déjà envoyés
export const Route = createFileRoute("/_private/tableau-de-bord/entrepots/$datastoreId/donnees/$storedDataId/details")({
    validateSearch: (search: { datasheetName?: string } & SearchSchemaInput): { datasheetName?: string } => ({
        datasheetName: stringParam(search.datasheetName),
    }),
    staticData: { matomoLabel: "Détails de donnée stockée" },
    beforeLoad: ({ params, search }) => {
        if (!search.datasheetName) throw notFound();
        throw redirect({
            to: "/tableau-de-bord/entrepots/$datastoreId/donnees/$datasheetName/donnees/$storedDataId",
            params: { datastoreId: params.datastoreId, datasheetName: search.datasheetName, storedDataId: params.storedDataId },
            replace: true,
        });
    },
});
