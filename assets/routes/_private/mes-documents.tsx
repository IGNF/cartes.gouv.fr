import { createFileRoute, notFound } from "@tanstack/react-router";

import MyDocuments from "@/entrepot/pages/users/documents/MyDocuments";

export const Route = createFileRoute("/_private/mes-documents")({
    staticData: { matomoLabel: "Mes documents" },
    // page de test de l’API /users/me/documents, absente hors développement
    beforeLoad: () => {
        if (!import.meta.env.DEV) throw notFound();
    },
    component: RouteComponent,
});

function RouteComponent() {
    return <MyDocuments />;
}
