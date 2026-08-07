import { createFileRoute, notFound } from "@tanstack/react-router";

import MyDocuments from "@/entrepot/pages/users/documents/MyDocuments";

// Route de debug de l'API /users/me/documents : jamais atteignable en prod (404 avant chargement du chunk)
export const Route = createFileRoute("/_private/mes-documents")({
    beforeLoad: () => {
        if (!import.meta.env.DEV) {
            throw notFound();
        }
    },
    component: MyDocuments,
});
