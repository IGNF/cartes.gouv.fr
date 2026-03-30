import { create } from "zustand";

interface AuthStore {
    logoutInProgress: boolean;
    setLogoutInProgress: (logoutInProgress: boolean) => void;

    sessionExpired: boolean;
    setSessionExpired: (sessionExpired: boolean) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
    logoutInProgress: false,
    setLogoutInProgress: (logoutInProgress) => set(() => ({ logoutInProgress })),

    sessionExpired: false,
    setSessionExpired: (sessionExpired) => set(() => ({ sessionExpired })),
}));
