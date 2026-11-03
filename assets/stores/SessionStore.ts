import { create } from "zustand";

export type SessionStatus = "anonymous" | "active" | "expired";

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
    return now >= expiresAt ? "expired" : "active";
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
    status: "anonymous",
    expiresAt: null,
    applySession: (expiresAtSeconds, now = Date.now()) => {
        const expiresAt = typeof expiresAtSeconds === "number" && Number.isFinite(expiresAtSeconds) ? expiresAtSeconds * 1000 : null;
        set({ expiresAt, status: computeStatus(expiresAt, now) });
    },
    tick: (now = Date.now()) => {
        const { status, expiresAt } = get();
        if (status === "active" && computeStatus(expiresAt, now) === "expired") {
            set({ status: "expired" });
        }
    },
    markExpired: () => {
        if (get().status !== "anonymous") {
            set({ status: "expired" });
        }
    },
}));
