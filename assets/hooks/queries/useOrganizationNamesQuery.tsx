import { useQuery } from "@tanstack/react-query";

import api from "@/entrepot/api";
import RQKeys from "@/modules/entrepot/RQKeys";
import { delta } from "@/utils";

/** noms triés des organismes du catalogue (autocomplétion producteur) */
export default function useOrganizationNamesQuery(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: RQKeys.catalogs_organizations(),
        queryFn: ({ signal }) => api.catalogs.getAllOrganizations({ signal }),
        staleTime: delta.hours(10),
        select: (organizations) => organizations.map((org) => org.name.trim()).sort(),
        ...options,
    });
}
