import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import DiscoverPublish from "@/pages/discover/publish/DiscoverPublish";
import { optionalNumberParam } from "@/router/searchParams";

type DiscoverPublishSearch = {
    authentication_failed?: number;
    session_expired_login_success?: number;
};

export const Route = createFileRoute("/_public/publier-une-donnee")({
    validateSearch: (search: DiscoverPublishSearch & SearchSchemaInput): DiscoverPublishSearch => ({
        authentication_failed: optionalNumberParam(search.authentication_failed),
        session_expired_login_success: optionalNumberParam(search.session_expired_login_success),
    }),
    component: DiscoverPublish,
});
