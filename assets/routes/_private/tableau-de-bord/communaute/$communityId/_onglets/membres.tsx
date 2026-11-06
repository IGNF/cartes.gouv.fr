import { createFileRoute, SearchSchemaInput, stripSearchParams } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import CommunityMembers from "@/entrepot/pages/communities/CommunityMembers/CommunityMembers";
import { positiveIntegerParam, stringParam } from "@/router/searchParams";

// valeurs par défaut absentes de l’URL, comme avant la bascule
const defaults = { page: 1, limit: 20, search: "" } as const;

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId/_onglets/membres")({
    validateSearch: (
        search: { userId?: string; page?: number; limit?: number; search?: string } & SearchSchemaInput
    ): { userId?: string; page: number; limit: number; search: string } => ({
        userId: stringParam(search.userId),
        page: positiveIntegerParam(search.page) ?? defaults.page,
        limit: positiveIntegerParam(search.limit) ?? defaults.limit,
        search: stringParam(search.search) ?? defaults.search,
    }),
    search: { middlewares: [stripSearchParams(defaults)] },
    staticData: { matomoLabel: "Membres", requiredRights: [CommunityMemberDtoRightsEnum.COMMUNITY] },
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = Route.useSearch();
    return <CommunityMembers userId={userId} />;
}
