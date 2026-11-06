import { createFileRoute, SearchSchemaInput } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import CommunityMembers from "@/entrepot/pages/communities/CommunityMembers/CommunityMembers";
import { positiveIntegerParam, stringParam } from "@/router/searchParams";

export const Route = createFileRoute("/_private/tableau-de-bord/communaute/$communityId/_onglets/membres")({
    validateSearch: (
        search: { userId?: string; page?: number; limit?: number; search?: string } & SearchSchemaInput
    ): { userId?: string; page: number; limit: number; search: string } => ({
        userId: stringParam(search.userId),
        page: positiveIntegerParam(search.page) ?? 1,
        limit: positiveIntegerParam(search.limit) ?? 20,
        search: stringParam(search.search) ?? "",
    }),
    staticData: { matomoLabel: "Membres", requiredRights: [CommunityMemberDtoRightsEnum.COMMUNITY] },
    component: RouteComponent,
});

function RouteComponent() {
    const { userId } = Route.useSearch();
    return <CommunityMembers userId={userId} />;
}
