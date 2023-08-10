import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";

import api from "../../api";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import { useDatastoreList } from "../../hooks/useDatastoreList";
import RCKeys from "../../modules/RCKeys";
import { routes } from "../../router/router";
import AppLayout from "./AppLayout";

type DatastoreLayoutProps = {
    datastoreId: string;
};
const DatastoreLayout: FC<PropsWithChildren<DatastoreLayoutProps>> = ({ datastoreId, children }) => {
    const navItems = datastoreNavItems(datastoreId);

    const abortController = new AbortController();

    const datastoreListQuery = useDatastoreList();
    const datastoreQuery = useQuery({
        queryKey: RCKeys.datastore(datastoreId),
        queryFn: () => api.datastore.get(datastoreId, { signal: abortController.signal }),
        staleTime: 3600000,
    });

    const datastoreLinks: MainNavigationProps.Item.Menu = {
        text: datastoreQuery?.data?.name ?? "Choisir un espace de travail",
        menuLinks:
            datastoreListQuery.data?.map((datastore) => ({
                linkProps: routes.datasheet_list({ datastoreId: datastore._id }).link,
                text: datastore.name,
            })) || [],
    };

    return <AppLayout navItems={[...navItems, datastoreLinks]}>{children}</AppLayout>;
};

export default DatastoreLayout;
