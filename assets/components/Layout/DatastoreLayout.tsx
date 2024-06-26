import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import api from "../../entrepot/api";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import RQKeys from "../../modules/entrepot/RQKeys";
import AppLayout from "./AppLayout";

type DatastoreLayoutProps = {
    datastoreId: string;
    documentTitle?: string;
};
const DatastoreLayout: FC<PropsWithChildren<DatastoreLayoutProps>> = ({ datastoreId, documentTitle, children }) => {
    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const navItems = useMemo(() => datastoreNavItems(datastoreQuery.data), [datastoreQuery.data]);

    return (
        <AppLayout navItems={navItems} documentTitle={documentTitle}>
            {children}
        </AppLayout>
    );
};

export default memo(DatastoreLayout);
