import { useMatches } from "@tanstack/react-router";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";

/** Droits requis déclarés par la route matchée la plus profonde (staticData.requiredRights) ; vide = appartenance seule */
export default function useRequiredRights(): CommunityMemberDtoRightsEnum[] {
    const matches = useMatches();

    for (let i = matches.length - 1; i >= 0; i--) {
        const requiredRights = matches[i].staticData?.requiredRights;
        if (requiredRights) {
            return requiredRights;
        }
    }
    return [];
}
