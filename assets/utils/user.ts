import { CartesUser } from "@/@types/app";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";

/**
 * Chargement des données de l'utilisateur à partir du DOM dans le cache de react-query.
 * Cette initialisation est faite avant le premier rendu de l'application.
 */
export function bootstrapUser(): void {
    let cartesUser: CartesUser | null = null;

    try {
        const raw = (document.getElementById("user") as HTMLDivElement | null)?.dataset?.user ?? null;
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                cartesUser = parsed as CartesUser;
            }
        }
    } catch {
        // ne rien faire, cartesUser restera à null
    }

    queryClient.setQueryData<CartesUser | null>(RQKeys.user_me(), cartesUser);
}
