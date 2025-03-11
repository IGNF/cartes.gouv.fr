import { create } from "zustand";

interface ApiEspaceCoStore {
    api_espaceco_url: string | null;
    setApiEspacecoUrl: (url: string | null) => void;
    isUrlDefined: () => boolean;
}

/* l'url de l'API espace collaboratif (definie dans le .env.local, ensuite injecté dans le twig) */
const url = (document.getElementById("root") as HTMLDivElement)?.dataset?.["apiEspacecoUrl"] ?? null;

export const useApiEspaceCoStore = create<ApiEspaceCoStore>()((set, get) => ({
    api_espaceco_url: url,
    setApiEspacecoUrl: (api_espaceco_url) => set(() => ({ api_espaceco_url })),
    isUrlDefined: () => get().api_espaceco_url !== null,
}));
