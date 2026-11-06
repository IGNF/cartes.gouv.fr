import { createFileRoute } from "@tanstack/react-router";

import UserKeyForm from "@/entrepot/pages/users/keys/UserKeyForm";

export const Route = createFileRoute("/_private/mes-cles/$keyId/modification")({
    staticData: { matomoLabel: "Modification de la clé" },
    component: RouteComponent,
});

function RouteComponent() {
    const { keyId } = Route.useParams();
    return <UserKeyForm keyId={keyId} />;
}
