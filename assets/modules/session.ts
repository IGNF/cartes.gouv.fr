import { CartesUser } from "@/@types/app";
import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { queryClient } from "@/modules/queryClient";
import SymfonyRouting from "@/modules/Routing";
import { EXPIRING_THRESHOLD_MS, useSessionStore } from "@/stores/SessionStore";
import { ApiError } from "./jsonFetch";

/**
 * Horloge de session et reconnexion par popup, hors React : le store `SessionStore` porte l’état,
 * ce module le fait avancer et le remet à jour après un passage par Keycloak.
 */

export const LOGIN_POPUP_NAME = "cartesgouvfr-login";
export const LOGIN_POPUP_FEATURES = "popup,width=500,height=650";
const POPUP_POLL_MS = 500;
// au-delà, setTimeout déborde et se déclenche tout de suite
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

let clockStarted = false;
let clockTimer: ReturnType<typeof setTimeout> | null = null;
let popup: Window | null = null;
let popupPoll: ReturnType<typeof setInterval> | null = null;
let checkInFlight: Promise<void> | null = null;
let checkRequested = false;

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
    if (expiresAt === null || status === "expired") return;

    const boundary = status === "active" ? expiresAt - EXPIRING_THRESHOLD_MS : expiresAt;
    const delay = Math.min(Math.max(boundary - Date.now(), 0) + 1000, MAX_TIMEOUT_MS);
    clockTimer = setTimeout(tick, delay);
}

function tick(): void {
    useSessionStore.getState().tick();
    scheduleTick();
}

// les onglets en arrière-plan bridant les minuteries, l’horloge est revérifiée au retour sur la page ;
// expirée, la session est revérifiée côté serveur : c’est ainsi qu’un autre onglet apprend une reconnexion
function revalidate(): void {
    if (document.visibilityState !== "visible") return;
    tick();
    if (useSessionStore.getState().status === "expired") {
        void checkSession();
    }
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
    clockStarted = false;
    clockTimer = null;
    popup = null;
    popupPoll = null;
    checkInFlight = null;
    checkRequested = false;
}

/** ouvre la connexion Keycloak dans une popup, depuis un gestionnaire de clic (sinon le navigateur la bloque) */
export function reconnect(): void {
    if (popup !== null && !popup.closed) {
        popup.focus();
        return;
    }

    popup = window.open(SymfonyRouting.generate("cartesgouvfr_security_login", { popup: 1 }), LOGIN_POPUP_NAME, LOGIN_POPUP_FEATURES);
    if (popup === null) {
        // popup bloquée : connexion dans l’onglet, retour sur la page par le referer
        window.location.assign(SymfonyRouting.generate("cartesgouvfr_security_login"));
        return;
    }

    // pas de postMessage : la page de retour se ferme seule, la fermeture est le signal
    popupPoll = setInterval(() => {
        if (popup !== null && !popup.closed) return;
        if (popupPoll !== null) clearInterval(popupPoll);
        popupPoll = null;
        popup = null;
        void checkSession();
    }, POPUP_POLL_MS);
}

/** relit /api/users/me ; une demande reçue pendant un appel en vol relance un appel à sa fin */
export function checkSession(): Promise<void> {
    if (checkInFlight !== null) {
        checkRequested = true;
        return checkInFlight;
    }
    checkInFlight = runCheck().finally(() => {
        checkInFlight = null;
        if (checkRequested) {
            checkRequested = false;
            void checkSession();
        }
    });
    return checkInFlight;
}

async function runCheck(): Promise<void> {
    let user: CartesUser | null;
    try {
        user = await api.user.getMe();
    } catch (error) {
        if ((error as Partial<ApiError> | null)?.status === 401) {
            useSessionStore.getState().markExpired();
        }
        // erreur réseau ou amont : l’état ne change pas, le bouton reste cliquable
        return;
    }
    if (user === null) return;

    // dans cet ordre : la requête utilisateur se réactive sur le statut, l’invalidation ne recharge pas une requête désactivée
    queryClient.setQueryData(RQKeys.user_me(), user);
    applyUser(user);
    void queryClient.invalidateQueries();
}
