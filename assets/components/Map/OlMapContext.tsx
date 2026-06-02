import { createContext, useContext, type PropsWithChildren } from "react";
import type Map from "ol/Map";

type OlMapContextValue = { map: Map | undefined };

const OlMapContext = createContext<OlMapContextValue | null>(null);

export function OlMapProvider({ map, children }: PropsWithChildren<{ map?: Map }>) {
    return <OlMapContext.Provider value={{ map }}>{children}</OlMapContext.Provider>;
}

export function useOlMapContext(): OlMapContextValue {
    const ctx = useContext(OlMapContext);
    if (ctx === null) {
        throw new Error("useOlMapContext must be used within an OlMapProvider");
    }
    return ctx;
}
