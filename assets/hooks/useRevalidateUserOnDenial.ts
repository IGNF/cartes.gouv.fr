import { useEffect, useState } from "react";

import { USER_ME_REVALIDATION_WINDOW } from "@/modules/queryClient";
import useUserQuery from "./queries/useUserQuery";

/**
 * Avant d'afficher un refus d'accès définitif, force UNE revalidation de user_me :
 * l'appartenance a pu changer côté serveur depuis la mise en cache.
 * Se réinitialise quand le refus est levé ou quand la ressource visée (resourceId) change.
 * Retourne true quand le refus peut être affiché (revalidation faite ou non nécessaire).
 */
export default function useRevalidateUserOnDenial(denied: boolean, resourceId: string): boolean {
    const { refetch, dataUpdatedAt } = useUserQuery();
    const [settledFor, setSettledFor] = useState<string | null>(null);

    useEffect(() => {
        if (!denied) {
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
        refetch({ cancelRefetch: false }).finally(() => setSettledFor(resourceId));
    }, [denied, resourceId, dataUpdatedAt, refetch]);

    return denied ? settledFor === resourceId : true;
}
