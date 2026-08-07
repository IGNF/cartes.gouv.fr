import { createFileRoute } from "@tanstack/react-router";

import PageNotFound from "@/pages/error/PageNotFound";

// Route 404 explicite conservée : cible de redirections externes (les 404 internes passent par les notFoundComponent)
export const Route = createFileRoute("/_public/404")({
    component: PageNotFound,
});
