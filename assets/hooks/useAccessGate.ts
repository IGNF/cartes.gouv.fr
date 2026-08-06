import { useEffect, useState } from "react";

import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import { USER_ME_REVALIDATION_WINDOW } from "@/modules/queryClient";
import { CommunityRef, hasAccess } from "@/utils";
import useUserQuery from "./queries/useUserQuery";

export type AccessGateStatus = "checking" | "granted" | "denied";

/**
 * Gate d'accès à une ressource : décision depuis le cache user_me, avec UNE revalidation
 * avant tout refus définitif (l'appartenance a pu changer côté serveur).
 * Reste "checking" tant que cette revalidation n'est pas faite ; se réinitialise quand
 * le refus est levé ou quand la ressource visée change.
 */
export default function useAccessGate(ref: CommunityRef, requiredRights?: CommunityMemberDtoRightsEnum[]): AccessGateStatus {
    const { data: user, refetch, dataUpdatedAt } = useUserQuery();
    const [settledFor, setSettledFor] = useState<string | null>(null);

    const granted = hasAccess(user, ref, requiredRights);
    const resourceId = ref.datastoreId ?? ref.communityId;

    useEffect(() => {
        if (granted) {
            // refus levé : réinitialisation pour un éventuel refus ultérieur
            setSettledFor((current) => (current === null ? current : null));
            return;
        }
        // user_me vient d'être (re)chargé : inutile de le redemander
        if (Date.now() - dataUpdatedAt < USER_ME_REVALIDATION_WINDOW) {
            setSettledFor(resourceId);
            return;
        }
        // cancelRefetch: false → se greffe sur une requête déjà en vol au lieu de l'annuler
        let stale = false;
        refetch({ cancelRefetch: false }).finally(() => {
            // ignorer le callback si l'effet a été invalidé entre-temps (navigation rapide)
            if (!stale) setSettledFor(resourceId);
        });
        return () => {
            stale = true;
        };
    }, [granted, resourceId, dataUpdatedAt, refetch]);

    if (granted) return "granted";
    return settledFor === resourceId ? "denied" : "checking";
}
