import { routes, useRoute } from "@/router/router";

import TertiaryNavigation from "./TertiaryNavigation";

type DatastoreTertiaryNavigationProps = {
    datastoreId: string;
    communityId: string;
};
export default function DatastoreTertiaryNavigation(props: DatastoreTertiaryNavigationProps) {
    const { datastoreId, communityId } = props;
    const { name: routeName } = useRoute();

    return (
        <TertiaryNavigation
            items={[
                {
                    text: "Fiches de données",
                    linkProps: routes.datasheet_list({ datastoreId }).link,
                    isActive: routeName === "datasheet_list",
                },
                {
                    text: "Membres",
                    linkProps: routes.members_list({ communityId: communityId }).link,
                    isActive: routeName === "members_list",
                },
                {
                    text: "Permissions",
                    linkProps: routes.datastore_manage_permissions({ datastoreId }).link,
                    isActive: routeName === "datastore_manage_permissions",
                },
                {
                    text: "Consommation",
                    linkProps: routes.datastore_manage_storage({ datastoreId }).link,
                    isActive: routeName === "datastore_manage_storage",
                },
                {
                    text: "Info",
                    linkProps: routes.community_info({ communityId }).link,
                    isActive: routeName === "community_info",
                },
            ]}
        />
    );
}
