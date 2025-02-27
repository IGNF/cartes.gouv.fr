import { RefLayerTools } from "@/@types/espaceco";
import { createContext, ReactNode, useContext } from "react";

export const refLayersContext = createContext<Record<RefLayerTools, { id: string; name: string }[]>>({
    snap: [],
    shortestpath: [],
});

export function useRefLayers() {
    return useContext(refLayersContext);
}

export function RefLayersProvider({ children, refLayers }: { children: ReactNode; refLayers: Record<RefLayerTools, { id: string; name: string }[]> }) {
    return <refLayersContext.Provider value={refLayers}>{children}</refLayersContext.Provider>;
}
