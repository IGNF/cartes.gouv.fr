import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useContext, useMemo } from "react";

import { communityContext } from "@/contexts/community";
import { datastoreContext } from "../contexts/datastore";
import getBreadcrumb from "../modules/entrepot/breadcrumbs/Breadcrumb";
import { useRoute } from "../router/router";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    const route = useRoute();
    const { datastore } = useContext(datastoreContext);
    const community = useContext(communityContext);

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(route, datastore, community);
    }, [route, datastore, community, customBreadcrumbProps]);
}
