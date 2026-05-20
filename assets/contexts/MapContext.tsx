import { createContext, useContext, type PropsWithChildren } from "react";
import type Map from "ol/Map";

type MapContextValue = { map: Map | undefined };

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ map, children }: PropsWithChildren<{ map?: Map }>) {
    return <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>;
}

export function useMapContext(): MapContextValue {
    const ctx = useContext(MapContext);
    if (ctx === null) {
        throw new Error("useMapContext must be used within a MapProvider");
    }
    return ctx;
}
