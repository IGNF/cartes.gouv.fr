import { MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation";
import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";

import api from "../../api";
import { datastoreNavItems } from "../../config/datastoreNavItems";
import { useDatastoreList } from "../../hooks/useDatastoreList";
import RQKeys from "../../modules/RQKeys";
import { routes } from "../../router/router";
import AppLayout from "./AppLayout";
import Translator from "../../modules/Translator";

type DatastoreLayoutProps = {
    datastoreId: string;
    documentTitle?: string;
};
const DatastoreLayout: FC<PropsWithChildren<DatastoreLayoutProps>> = ({ datastoreId, documentTitle, children }) => {
    const navItems = datastoreNavItems(datastoreId);

    const datastoreListQuery = useDatastoreList();
    const datastoreQuery = useQuery({
        queryKey: RQKeys.datastore(datastoreId),
        queryFn: ({ signal }) => api.datastore.get(datastoreId, { signal }),
        staleTime: 3600000,
    });

    const datastoreLinks: MainNavigationProps.Item.Menu = {
        text: datastoreQuery?.data?.name ?? "Choisir un espace de travail",
        menuLinks:
            datastoreListQuery.data?.map((datastore) => ({
                linkProps: routes.datasheet_list({ datastoreId: datastore._id }).link,
                text: datastore.name,
                isActive: datastore._id === datastoreQuery.data?._id,
            })) || [],
    };

    datastoreLinks.menuLinks.push({
        text: Translator.trans("datastore_creation_request.title"),
        linkProps: routes.datastore_create_request().link,
    });

    return (
        <AppLayout navItems={[...navItems, datastoreLinks]} documentTitle={documentTitle}>
            {children}
        </AppLayout>
    );
};

export default DatastoreLayout;
