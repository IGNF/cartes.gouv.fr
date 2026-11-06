import { createFileRoute, notFound } from "@tanstack/react-router";

import MemberInvitation from "@/espaceco/pages/communities/MemberInvitation";

export const Route = createFileRoute("/_private/espace-collaboratif/$communityId/invitation")({
    staticData: { matomoLabel: "Invitation" },
    params: {
        parse: (raw) => ({ communityId: Number(raw.communityId) }),
        stringify: (params) => ({ communityId: String(params.communityId) }),
    },
    beforeLoad: ({ params }) => {
        if (!Number.isInteger(params.communityId)) throw notFound();
    },
    component: RouteComponent,
});

function RouteComponent() {
    const { communityId } = Route.useParams();
    return <MemberInvitation communityId={communityId} />;
}
