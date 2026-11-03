import { create } from "zustand";

export type SessionStatus = "anonymous" | "active" | "expiring" | "expired";

/** l’alerte « session expire bientôt » s’affiche 30 minutes avant l’expiration */
export const EXPIRING_THRESHOLD_MS = 30 * 60 * 1000;

interface SessionStore {
    status: SessionStatus;
    /** expiration de la session en millisecondes Unix, null pour un visiteur anonyme */
    expiresAt: number | null;
    /** charge utilisateur reçue (#user ou /api/users/me) : fixe l’expiration et recalcule le statut */
    applySession: (expiresAtSeconds: number | null, now?: number) => void;
    /** recalcul depuis l’horloge : ne fait qu’avancer, un 401 déjà reçu n’est pas annulé */
    tick: (now?: number) => void;
    /** 401 reçu alors qu’un utilisateur est connu (appelé par apiFetch) */
    markExpired: () => void;
}

export function computeStatus(expiresAt: number | null, now: number): SessionStatus {
    if (expiresAt === null) return "anonymous";
    if (now >= expiresAt) return "expired";
    if (now >= expiresAt - EXPIRING_THRESHOLD_MS) return "expiring";
    return "active";
}

const rank: Record<SessionStatus, number> = { anonymous: 0, active: 1, expiring: 2, expired: 3 };

export const useSessionStore = create<SessionStore>()((set, get) => ({
    status: "anonymous",
    expiresAt: null,
    applySession: (expiresAtSeconds, now = Date.now()) => {
        const expiresAt = typeof expiresAtSeconds === "number" && Number.isFinite(expiresAtSeconds) ? expiresAtSeconds * 1000 : null;
        set({ expiresAt, status: computeStatus(expiresAt, now) });
    },
    tick: (now = Date.now()) => {
        const { status, expiresAt } = get();
        const next = computeStatus(expiresAt, now);
        if (rank[next] > rank[status]) {
            set({ status: next });
        }
    },
    markExpired: () => {
        if (get().status !== "anonymous") {
            set({ status: "expired" });
        }
    },
}));
