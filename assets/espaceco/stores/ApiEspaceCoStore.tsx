import { create } from "zustand";

import { espaceCoUrl } from "@/env";

interface ApiEspaceCoStore {
    api_espaceco_url: string | null;
    setApiEspacecoUrl: (url: string | null) => void;
    isUrlDefined: () => boolean;
}

export const useApiEspaceCoStore = create<ApiEspaceCoStore>()((set, get) => ({
    api_espaceco_url: espaceCoUrl,
    setApiEspacecoUrl: (api_espaceco_url) => set(() => ({ api_espaceco_url })),
    isUrlDefined: () => get().api_espaceco_url !== null,
}));
