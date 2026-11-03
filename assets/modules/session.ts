import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { useSessionStore } from "@/stores/SessionStore";

/** horloge de session et reconnexion par popup, hors React ; l’état lui-même vit dans `SessionStore` */

export const LOGIN_POPUP_NAME = "cartesgouvfr-login";
export const LOGIN_POPUP_FEATURES = "popup,width=500,height=650";
const POPUP_POLL_MS = 500;
// au-delà, setTimeout déborde et se déclenche tout de suite
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

let clockStarted = false;
let clockTimer: ReturnType<typeof setTimeout> | null = null;
let popup: Window | null = null;
let popupPoll: ReturnType<typeof setInterval> | null = null;
let check: AbortController | null = null;

/** charge utilisateur reçue (#user au démarrage, réponse de /api/users/me) */
export function applyUser(user: CartesUser | null): void {
    useSessionStore.getState().applySession(user?.session_expires_at ?? null);
    scheduleTick();
}

function scheduleTick(): void {
    if (clockTimer !== null) {
        clearTimeout(clockTimer);
        clockTimer = null;
    }
    const { status, expiresAt } = useSessionStore.getState();
    if (expiresAt === null || status !== "active") return;

    const delay = Math.min(Math.max(expiresAt - Date.now(), 0) + 1000, MAX_TIMEOUT_MS);
    clockTimer = setTimeout(tick, delay);
}

function tick(): void {
    useSessionStore.getState().tick();
    scheduleTick();
}

// retour sur la page : l’horloge est revérifiée, les onglets en arrière-plan bridant les minuteries
function revalidate(): void {
    if (document.visibilityState !== "visible") return;
    tick();
}

/** à appeler une fois après `bootstrapUser()`, avant le premier rendu */
export function startSessionClock(): void {
    if (clockStarted) return;
    clockStarted = true;
    applyUser(queryClient.getQueryData<CartesUser | null>(RQKeys.user_me()) ?? null);
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
}

export function stopSessionClock(): void {
    window.removeEventListener("focus", revalidate);
    document.removeEventListener("visibilitychange", revalidate);
    if (clockTimer !== null) clearTimeout(clockTimer);
    if (popupPoll !== null) clearInterval(popupPoll);
    check?.abort();
    clockStarted = false;
    clockTimer = null;
    popup = null;
    popupPoll = null;
    check = null;
}

/** ouvre la connexion Keycloak dans une popup, depuis un gestionnaire de clic (sinon le navigateur la bloque) */
export function reconnect(): void {
    if (popup !== null && !popup.closed) {
        popup.focus();
        return;
    }

    // une interrogation ou une relecture encore en cours (popup fermée à l’instant) ne chevauche pas la nouvelle
    if (popupPoll !== null) {
        clearInterval(popupPoll);
        popupPoll = null;
    }
    check?.abort();

    popup = window.open(SymfonyRouting.generate("cartesgouvfr_security_login", { popup: 1 }), LOGIN_POPUP_NAME, LOGIN_POPUP_FEATURES);
    if (popup === null) {
        // popup bloquée : connexion dans l’onglet, retour sur la page par le referer
        window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
        return;
    }

    // pas de postMessage : la page de retour se ferme seule, la fermeture est le signal
    const poll = setInterval(() => {
        if (popup !== null && !popup.closed) return;
        clearInterval(poll);
        if (popupPoll === poll) popupPoll = null;
        popup = null;
        void checkSession();
    }, POPUP_POLL_MS);
    popupPoll = poll;
}

/** relit /api/users/me après la fermeture de la popup */
export async function checkSession(): Promise<void> {
    const controller = new AbortController();
    check = controller;

    let user: CartesUser | null;
    try {
        user = await api.user.getMe({ signal: controller.signal });
    } catch {
        // 401 : déjà signalé au store par apiFetch ; annulation, erreur réseau ou amont : état inchangé, le bouton reste cliquable
        return;
    } finally {
        if (check === controller) check = null;
    }
    if (user === null) return;

    // dans cet ordre : la requête utilisateur se réactive sur le statut, l’invalidation ne recharge pas une requête désactivée
    queryClient.setQueryData(RQKeys.user_me(), user);
    applyUser(user);
    void queryClient.invalidateQueries();
}

// rechargement à chaud : l’ancienne instance du module relâche ses écouteurs et minuteries
import.meta.hot?.dispose(stopSessionClock);
