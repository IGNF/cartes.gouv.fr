import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export interface IMapStyleContext {
    selectedTable: string;
    setSelectedTable: (table: string) => void;
}

export const mapStyleContext = createContext<IMapStyleContext | null>(null);

export function useMapStyle() {
    const datastore = useContext(mapStyleContext);
    if (!datastore) {
        throw new Error("useMapStyle must be used within a MapStyleProvider");
    }
    return datastore as Required<IMapStyleContext>;
}

interface IMapStyleProviderProps {
    children: ReactNode;
    defaultTable: string;
}

export function MapStyleProvider(props: IMapStyleProviderProps) {
    const { children, defaultTable } = props;
    const [selectedTable, setSelectedTable] = useState(defaultTable);
    const context = useMemo(() => ({ selectedTable, setSelectedTable }), [selectedTable]);
    return <mapStyleContext.Provider value={context}>{children}</mapStyleContext.Provider>;
}
