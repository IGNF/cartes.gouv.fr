import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export interface IMapStyleContext {
    editMode: boolean;
    selectedTable: string;
    setSelectedTable: (table: string) => void;
}

export const mapStyleContext = createContext<IMapStyleContext | null>(null);

export function useMapStyle() {
    const context = useContext(mapStyleContext);
    if (!context) {
        throw new Error("useMapStyle must be used within a MapStyleProvider");
    }
    return context as Required<IMapStyleContext>;
}

interface IMapStyleProviderProps {
    children: ReactNode;
    editMode: boolean;
    defaultTable: string;
}

export function MapStyleProvider(props: IMapStyleProviderProps) {
    const { children, editMode, defaultTable } = props;
    const [selectedTable, setSelectedTable] = useState(defaultTable);
    const context = useMemo(() => ({ editMode, selectedTable, setSelectedTable }), [editMode, selectedTable]);
    return <mapStyleContext.Provider value={context}>{children}</mapStyleContext.Provider>;
}
