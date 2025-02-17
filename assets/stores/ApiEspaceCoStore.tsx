import { create } from "zustand";

interface ApiEspaceCoStore {
    api_espaceco_url: string | null;
    setApiEspacecoUrl: (url: string | null) => void;
    isUrlDefined: () => boolean;
}

/* l'url de l'API espace collaboratif (definie dans le .env.local, récupéré et injecté par vite) */
const url =
    import.meta.env?.API_ESPACE_COLLABORATIF_URL && import.meta.env.API_ESPACE_COLLABORATIF_URL !== "" ? import.meta.env.API_ESPACE_COLLABORATIF_URL : null;

export const useApiEspaceCoStore = create<ApiEspaceCoStore>()((set, get) => ({
    api_espaceco_url: url,
    setApiEspacecoUrl: (api_espaceco_url) => set(() => ({ api_espaceco_url })),
    isUrlDefined: () => get().api_espaceco_url !== null,
}));
