import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { use, useMemo } from "react";

import { CommunityContext } from "@/contexts/community";
import { DatastoreContext } from "../contexts/datastore";
import getBreadcrumb from "../modules/entrepot/breadcrumbs/Breadcrumb";
import { useRoute } from "../router/router";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    const route = useRoute();
    const { datastore } = use(DatastoreContext);
    const community = use(CommunityContext);

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(route, datastore, community);
    }, [route, datastore, community, customBreadcrumbProps]);
}
