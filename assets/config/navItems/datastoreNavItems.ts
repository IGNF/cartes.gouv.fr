import { type MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";

import { useApiEspaceCoStore } from "@/espaceco/stores/ApiEspaceCoStore";
import { Datastore } from "../../@types/app";
import { getTranslation } from "../../i18n/i18n";
import { routes } from "../../router/router";
import { useAuthStore } from "../../stores/AuthStore";
import { assistanceNavItems } from "./assistanceNavItems";

const { t } = getTranslation("datastoreNavItems");
const { t: tNavItems } = getTranslation("navItems");

export const datastoreNavItems = (currentDatastore?: Datastore): MainNavigationProps.Item[] => {
    const user = useAuthStore.getState().user;
    const isApiEspaceCoDefined = useApiEspaceCoStore.getState().isUrlDefined;

    const navItems: MainNavigationProps.Item[] = [
        {
            text: t("dashboard"),
            linkProps: routes.dashboard_pro().link,
        },
    ];

    if (currentDatastore !== undefined) {
        navItems.push({
            text: t("data"),
            linkProps: routes.datasheet_list({ datastoreId: currentDatastore._id }).link,
        });
        navItems.push({
            text: t("members"),
            linkProps: routes.members_list({ communityId: currentDatastore.community._id }).link,
        });
        navItems.push({
            text: t("manage_storage"),
            menuLinks: [
                {
                    text: t("consumption_monitoring"),
                    linkProps: routes.datastore_manage_storage({ datastoreId: currentDatastore._id }).link,
                },
                {
                    text: t("permissions_granted"),
                    linkProps: routes.datastore_manage_permissions({ datastoreId: currentDatastore._id }).link,
                },
            ],
        });
    }

    if (user !== null) {
        navItems.push({
            text: t("my_account"),
            linkProps: routes.my_account().link,
        });
        navItems.push({
            text: t("my_access_keys"),
            linkProps: routes.my_access_keys().link,
        });
    }

    if (isApiEspaceCoDefined()) {
        navItems.push({
            text: t("espaceco"),
            linkProps: routes.espaceco_community_list().link,
        });
    }

    navItems.push(assistanceNavItems(tNavItems));

    return navItems;
};
