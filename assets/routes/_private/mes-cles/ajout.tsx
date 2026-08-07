import { createFileRoute } from "@tanstack/react-router";

import UserKeyForm from "@/entrepot/pages/users/keys/UserKeyForm";

export const Route = createFileRoute("/_private/mes-cles/ajout")({
    component: UserKeyForm,
});
