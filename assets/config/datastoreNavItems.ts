import { type MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { declareComponentKeys } from "i18nifty";

import { Datastore } from "../@types/app";
import { Translations, getTranslation } from "../i18n/i18n";
import { routes } from "../router/router";
import { useAuthStore } from "../stores/AuthStore";
import { assistanceNavItems } from "./assistanceNavItems";

const { t } = getTranslation("datastoreNavItems");
const { t: tNavItems } = getTranslation("navItems");

export const datastoreNavItems = (currentDatastore?: Datastore): MainNavigationProps.Item[] => {
    const user = useAuthStore.getState().user;

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
            linkProps: routes.members_list({ datastoreId: currentDatastore._id }).link,
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

    navItems.push(assistanceNavItems(tNavItems));

    return navItems;
};

// traductions
export const { i18n } = declareComponentKeys<
    "dashboard" | "data" | "members" | "manage_storage" | "consumption_monitoring" | "permissions_granted" | "my_account" | "my_access_keys"
>()("datastoreNavItems");

export const datastoreNavItemsFrTranslations: Translations<"fr">["datastoreNavItems"] = {
    dashboard: "Tableau de bord",
    data: "Données",
    members: "Membres",
    manage_storage: "Gérer l’espace de travail",
    consumption_monitoring: "Suivi des consommations",
    permissions_granted: "Permissions accordées",
    my_account: "Mon compte",
    my_access_keys: "Mes clés d’accès",
};

export const datastoreNavItemsEnTranslations: Translations<"en">["datastoreNavItems"] = {
    dashboard: undefined,
    data: undefined,
    members: undefined,
    manage_storage: undefined,
    consumption_monitoring: undefined,
    permissions_granted: undefined,
    my_account: undefined,
    my_access_keys: undefined,
};
