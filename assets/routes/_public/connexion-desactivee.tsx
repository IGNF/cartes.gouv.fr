import { createFileRoute } from "@tanstack/react-router";

import LoginDisabled from "@/pages/LoginDisabled/LoginDisabled";

export const Route = createFileRoute("/_public/connexion-desactivee")({
    component: LoginDisabled,
});
