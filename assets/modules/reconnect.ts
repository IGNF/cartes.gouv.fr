import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { useAuthStore } from "@/stores/AuthStore";

export const LOGIN_POPUP_NAME = "cartesgouvfr-login";
export const LOGIN_POPUP_FEATURES = "popup,width=500,height=650";

let pending: Promise<void> | null = null;

/** reconnexion dans une popup Keycloak, à appeler depuis un gestionnaire de clic (sinon le navigateur la bloque) */
export function reconnect(): Promise<void> {
    // un second clic réutilise la popup en cours : rouvrir la renverrait au début du formulaire Keycloak
    pending ??= openAndWait().finally(() => {
        pending = null;
    });
    return pending;
}

async function openAndWait(): Promise<void> {
    const popup = window.open(SymfonyRouting.generate("cartesgouvfr_security_login", { popup: 1 }), LOGIN_POPUP_NAME, LOGIN_POPUP_FEATURES);
    if (popup === null) {
        // popup bloquée : connexion dans l’onglet, retour sur la page par le referer
        window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
        return;
    }
    await closed(popup);

    // 401 : déjà signalé au store par jsonFetch ; autre erreur : état inchangé, le lien reste cliquable
    const user = await api.user.getMe().catch(() => null);
    if (user === null) return;

    // autre compte : recharger plutôt que mêler sa session aux pages en cache de l’ancien
    const previous = queryClient.getQueryData<CartesUser | null>(RQKeys.user_me());
    if (previous && previous.id !== user.id) {
        window.location.reload();
        return;
    }

    // dans cet ordre : l’invalidation ne recharge pas une requête encore désactivée
    queryClient.setQueryData(RQKeys.user_me(), user);
    useAuthStore.getState().setSessionExpired(false);
    void queryClient.invalidateQueries();
}

// pas de postMessage : la page de retour se ferme seule, la fermeture est le signal
function closed(popup: Window): Promise<void> {
    return new Promise((resolve) => {
        const poll = setInterval(() => {
            if (!popup.closed) return;
            clearInterval(poll);
            resolve();
        }, 500);
    });
}
