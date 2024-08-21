import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, memo, useMemo } from "react";

import { datastoreNavItems } from "../../config/datastoreNavItems";
import api from "../../entrepot/api";
import RQKeys from "../../modules/entrepot/RQKeys";
import AppLayout from "./AppLayout";

type DatastoreLayoutProps = {
    datastoreId: string;
    documentTitle?: string;
    customBreadcrumbProps?: BreadcrumbProps;
};
const DatastoreLayout: FC<PropsWithChildren<DatastoreLayoutProps>> = ({ datastoreId, documentTitle, customBreadcrumbProps, children }) => {
    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const navItems = useMemo(() => datastoreNavItems(datastoreQuery.data), [datastoreQuery.data]);

    return (
        <AppLayout navItems={navItems} documentTitle={documentTitle} customBreadcrumbProps={customBreadcrumbProps}>
            {children}
        </AppLayout>
    );
};

export default memo(DatastoreLayout);
