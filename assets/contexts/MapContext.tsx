import { createContext, useContext, type PropsWithChildren } from "react";
import type Map from "ol/Map";

export type MapContextValue = {
    map?: Map;
};

const defaultValue: MapContextValue = { map: undefined };

export const MapContext = createContext<MapContextValue>(defaultValue);

export function MapProvider(props: PropsWithChildren<{ map?: Map }>) {
    const { map, children } = props;
    return <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>;
}

export function useMapContext() {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error("useMapContext must be used within a MapProvider");
    }
    return context;
}

export default MapContext;
