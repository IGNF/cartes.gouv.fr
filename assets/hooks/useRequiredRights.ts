import { useMatches } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";

const none: CommunityMemberDtoRightsEnum[] = [];

/** droits déclarés par la route matchée la plus profonde qui en déclare ; vide = appartenance seule */
export default function useRequiredRights(): CommunityMemberDtoRightsEnum[] {
    return useMatches({ select: (matches) => matches.findLast((match) => match.staticData.requiredRights)?.staticData.requiredRights ?? none });
}
