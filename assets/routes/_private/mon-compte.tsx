import { createFileRoute } from "@tanstack/react-router";

import Me from "@/entrepot/pages/users/me/Me";

export const Route = createFileRoute("/_private/mon-compte")({
    component: Me,
});
