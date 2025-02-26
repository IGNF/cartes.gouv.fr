import { RefLayerTools } from "@/@types/espaceco";
import { createContext, ReactNode, useContext } from "react";

export const refLayersContext = createContext<Record<RefLayerTools, Record<number, string>>>({
    snap: {},
    shortestpath: {},
});

export function useRefLayers() {
    return useContext(refLayersContext);
}

export function RefLayersProvider({ children, refLayers }: { children: ReactNode; refLayers: Record<RefLayerTools, Record<number, string>> }) {
    return <refLayersContext.Provider value={refLayers}>{children}</refLayersContext.Provider>;
}
