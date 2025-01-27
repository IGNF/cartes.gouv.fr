import { create } from "zustand";
import { IAlert } from "../@types/alert";

interface AlertStore {
    alerts: IAlert[];
    setAlerts: (alerts: IAlert[]) => void;
}

export const useAlertStore = create<AlertStore>()((set) => ({
    alerts: [],
    setAlerts: (alerts) => set({ alerts }),
}));
