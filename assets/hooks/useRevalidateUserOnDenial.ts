import { useEffect, useRef, useState } from "react";

import useUserQuery from "./queries/useUserQuery";

/**
 * Avant d'afficher un refus d'accès définitif, force UNE revalidation de user_me :
 * l'appartenance a pu changer côté serveur depuis la mise en cache.
 * Retourne true quand le refus peut être affiché (revalidation faite ou non nécessaire).
 */
export default function useRevalidateUserOnDenial(denied: boolean): boolean {
    const { refetch } = useUserQuery();
    const [settled, setSettled] = useState(false);
    const startedRef = useRef(false);

    useEffect(() => {
        if (!denied || startedRef.current) return;
        startedRef.current = true;
        refetch().finally(() => setSettled(true));
    }, [denied, refetch]);

    return denied ? settled : true;
}
