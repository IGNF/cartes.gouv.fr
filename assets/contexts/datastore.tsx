import { createContext, ReactNode, use, useMemo } from "react";
import { Datastore } from "../@types/app";

export interface IDatastoreContext {
    datastore?: Datastore;
    isFetching: boolean;
    status: "error" | "success" | "pending";
}

export const DatastoreContext = createContext<IDatastoreContext>({
    datastore: undefined,
    isFetching: false,
    status: "pending",
});

export function useDatastore() {
    const datastore = use(DatastoreContext);
    if (!datastore || !datastore.datastore) {
        throw new Error("useDatastore must be used within a DatastoreProvider");
    }
    return datastore as Required<IDatastoreContext>;
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
    return <DatastoreContext value={context}>{children}</DatastoreContext>;
}
