import { RefToolLayer } from "@/@types/app_espaceco";
import { RefLayerTools } from "@/@types/espaceco";
import { createContext, ReactNode, use } from "react";

export const RefLayersContext = createContext<Record<RefLayerTools, RefToolLayer[]>>({
    snap: [],
    shortestpath: [],
});

export function useRefLayers() {
    return use(RefLayersContext);
}

export function RefLayersProvider({ children, refLayers }: { children: ReactNode; refLayers: Record<RefLayerTools, RefToolLayer[]> }) {
    return <RefLayersContext value={refLayers}>{children}</RefLayersContext>;
}
