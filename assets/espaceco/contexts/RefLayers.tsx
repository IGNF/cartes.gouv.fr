import { RefToolLayer } from "@/@types/app_espaceco";
import { RefLayerTools } from "@/@types/espaceco";
import { createContext, ReactNode, useContext } from "react";

export const refLayersContext = createContext<Record<RefLayerTools, RefToolLayer[]>>({
    snap: [],
    shortestpath: [],
});

export function useRefLayers() {
    return useContext(refLayersContext);
}

export function RefLayersProvider({ children, refLayers }: { children: ReactNode; refLayers: Record<RefLayerTools, RefToolLayer[]> }) {
    return <refLayersContext.Provider value={refLayers}>{children}</refLayersContext.Provider>;
}
