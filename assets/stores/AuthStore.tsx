import { create } from "zustand";

interface AuthStore {
    sessionExpired: boolean;
    setSessionExpired: (sessionExpired: boolean) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
    sessionExpired: false,
    setSessionExpired: (sessionExpired) => set(() => ({ sessionExpired })),
}));
