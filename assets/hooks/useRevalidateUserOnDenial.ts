import { useEffect, useState } from "react";

import useUserQuery from "./queries/useUserQuery";

type RevalidationStep = "idle" | "started" | "settled";

/**
 * Avant d'afficher un refus d'accès définitif, force UNE revalidation de user_me :
 * l'appartenance a pu changer côté serveur depuis la mise en cache.
 * Se réinitialise quand le refus est levé ou quand la ressource visée (resourceId) change.
 * Retourne true quand le refus peut être affiché (revalidation faite ou non nécessaire).
 */
export default function useRevalidateUserOnDenial(denied: boolean, resourceId: string): boolean {
    const { refetch } = useUserQuery();
    const [state, setState] = useState<{ resourceId: string; step: RevalidationStep }>({ resourceId, step: "idle" });

    // une autre ressource est visée : l'état mémorisé ne s'applique plus, on réinitialise
    const step: RevalidationStep = state.resourceId === resourceId ? state.step : "idle";

    useEffect(() => {
        if (!denied) {
            // refus levé : réinitialisation pour un éventuel refus ultérieur
            setState((s) => (s.resourceId === resourceId && s.step === "idle" ? s : { resourceId, step: "idle" }));
            return;
        }
        if (step !== "idle") return;
        setState({ resourceId, step: "started" });
        refetch().finally(() => setState({ resourceId, step: "settled" }));
    }, [denied, resourceId, step, refetch]);

    return denied ? step === "settled" : true;
}
