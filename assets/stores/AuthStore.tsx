import { create } from "zustand";
import { CartesUser } from "../types/app";

interface AuthStore {
    user: CartesUser | null;
    setUser: (user: CartesUser | null) => void;

    isAuthenticated: () => boolean;

    sessionExpired: boolean;
    setSessionExpired: (sessionExpired: boolean) => void;
}

const userFromTwig = (document.getElementById("user") as HTMLDivElement)?.dataset?.user ?? null;
const user = userFromTwig === null ? null : JSON.parse(userFromTwig);

export const useAuthStore = create<AuthStore>()((set, get) => ({
    user: user,
    setUser: (user) => set(() => ({ user })),

    /** Vrai si user !== null */
    isAuthenticated: () => get().user !== null,

    sessionExpired: false,
    setSessionExpired: (sessionExpired) => set(() => ({ sessionExpired })),
}));
