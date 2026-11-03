import { create } from "zustand";

import { CartesUser } from "@/@types/app";

export type SessionStatus = "anonymous" | "active" | "expired";

interface SessionStore {
    status: SessionStatus;
    /** charge utilisateur reçue (#user au démarrage, réponse de /api/users/me) : la dernière réponse du serveur gagne */
    applyUser: (user: CartesUser | null) => void;
    /** 401 reçu alors qu’un utilisateur est connu (appelé par apiFetch) */
    markExpired: () => void;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
    status: "anonymous",
    applyUser: (user) => set({ status: user === null ? "anonymous" : "active" }),
    markExpired: () => {
        if (get().status !== "anonymous") {
            set({ status: "expired" });
        }
    },
}));
