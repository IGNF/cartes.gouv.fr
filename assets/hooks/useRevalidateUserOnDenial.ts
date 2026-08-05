import { useEffect, useRef, useState } from "react";

import useUserQuery from "./queries/useUserQuery";

/**
 * Avant d'afficher un refus d'accès définitif, force UNE revalidation de user_me :
 * l'appartenance a pu changer côté serveur depuis la mise en cache.
 * Se ré-arme quand le refus est levé ou quand la ressource visée (resourceId) change.
 * Retourne true quand le refus peut être affiché (revalidation faite ou non nécessaire).
 */
export default function useRevalidateUserOnDenial(denied: boolean, resourceId: string): boolean {
    const { refetch } = useUserQuery();
    const [settled, setSettled] = useState(false);
    const startedRef = useRef(false);

    // ré-armement si la ressource visée change (navigation d'un refus vers un autre refus)
    const [prevResourceId, setPrevResourceId] = useState(resourceId);
    if (prevResourceId !== resourceId) {
        setPrevResourceId(resourceId);
        setSettled(false);
        startedRef.current = false;
    }

    useEffect(() => {
        if (!denied) {
            // refus levé : ré-armement pour un éventuel refus ultérieur
            startedRef.current = false;
            setSettled(false);
            return;
        }
        if (startedRef.current) return;
        startedRef.current = true;
        refetch().finally(() => setSettled(true));
    }, [denied, resourceId, refetch]);

    return denied ? settled : true;
}
