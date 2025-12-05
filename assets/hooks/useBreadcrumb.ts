import { BreadcrumbProps } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useContext, useMemo } from "react";

import { datastoreContext } from "../contexts/datastore";
import getBreadcrumb from "../modules/entrepot/breadcrumbs/Breadcrumb";
import { useRoute } from "../router/router";

export default function useBreadcrumb(customBreadcrumbProps?: BreadcrumbProps) {
    const route = useRoute();
    const { datastore } = useContext(datastoreContext);

    return useMemo(() => {
        if (customBreadcrumbProps !== undefined) {
            return customBreadcrumbProps;
        }

        return getBreadcrumb(route, datastore);
    }, [route, datastore, customBreadcrumbProps]);
}
