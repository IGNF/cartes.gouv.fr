import { createContext, ReactNode, useContext, useMemo } from "react";
import { Datastore } from "../@types/app";

export interface IDatastoreContext {
    datastore?: Datastore;
    isFetching: boolean;
    status: "error" | "success" | "pending";
}

export const datastoreContext = createContext<IDatastoreContext>({
    datastore: undefined,
    isFetching: false,
    status: "pending",
});

export function useDatastore() {
    const datastore = useContext(datastoreContext);
    if (!datastore || !datastore.datastore) {
        throw new Error("useDatastore must be used within a DatastoreProvider");
    }
    return datastore;
}

interface IDatastoreProviderProps {
    children: ReactNode;
    datastore?: Datastore;
    isFetching: boolean;
    status: "error" | "success" | "pending";
}

export function DatastoreProvider(props: IDatastoreProviderProps) {
    const { children, datastore, isFetching, status } = props;
    const context = useMemo(() => ({ datastore, isFetching, status }), [datastore, isFetching, status]);
    return <datastoreContext.Provider value={context}>{children}</datastoreContext.Provider>;
}
