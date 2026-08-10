import { createFileRoute, notFound } from "@tanstack/react-router";

import MemberInvitation from "@/espaceco/pages/communities/MemberInvitation";
import PageNotFound from "@/pages/error/PageNotFound";

// communityId espaceco = number (params.parse/stringify) ; id non numérique → 404 dans beforeLoad
export const Route = createFileRoute("/_private/espace-collaboratif/$communityId/invitation")({
    params: {
        parse: (raw) => ({ communityId: Number(raw.communityId) }),
        stringify: ({ communityId }) => ({ communityId: String(communityId) }),
    },
    beforeLoad: ({ params }) => {
        if (!Number.isInteger(params.communityId)) {
            throw notFound();
        }
    },
    component: MemberInvitationRoute,
    notFoundComponent: PageNotFound,
});

function MemberInvitationRoute() {
    const { communityId } = Route.useParams();
    return <MemberInvitation communityId={communityId} />;
}
