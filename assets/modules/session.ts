import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { useSessionStore } from "@/stores/SessionStore";

export const LOGIN_POPUP_NAME = "cartesgouvfr-login";
export const LOGIN_POPUP_FEATURES = "popup,width=500,height=650";

/** reconnexion dans une popup Keycloak, depuis un gestionnaire de clic (sinon le navigateur la bloque) */
export async function reconnect(): Promise<void> {
    const popup = window.open(SymfonyRouting.generate("cartesgouvfr_security_login", { popup: 1 }), LOGIN_POPUP_NAME, LOGIN_POPUP_FEATURES);
    if (popup === null) {
        // popup bloquée : connexion dans l’onglet, retour sur la page par le referer
        window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
        return;
    }
    await closed(popup);

    // 401 : déjà signalé au store par apiFetch ; autre erreur : état inchangé, le bouton reste cliquable
    const user = await api.user.getMe().catch(() => null);
    if (user === null) return;

    // dans cet ordre : la requête utilisateur se réactive sur le statut, l’invalidation ne recharge pas une requête désactivée
    queryClient.setQueryData(RQKeys.user_me(), user);
    useSessionStore.getState().applyUser(user);
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
