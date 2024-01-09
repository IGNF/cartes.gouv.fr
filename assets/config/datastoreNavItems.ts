import { type MainNavigationProps } from "@codegouvfr/react-dsfr/MainNavigation/MainNavigation";
import { declareComponentKeys } from "i18nifty";

import { Translations, getTranslation } from "../i18n/i18n";
import { routes } from "../router/router";
import { useAuthStore } from "../stores/AuthStore";
import { Datastore } from "../types/app";

const { t } = getTranslation("datastoreNavItems");

export const datastoreNavItems = (datastoreList: Datastore[] = [], currentDatastore?: Datastore): MainNavigationProps.Item[] => {
    const user = useAuthStore.getState().user;

    const navItems: MainNavigationProps.Item[] = [
        {
            text: t("dashboard"),
            linkProps: routes.dashboard_pro().link,
        },
        // {
        //     text: "Visualisation",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Outils & Traitements",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Collaboration",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Portails",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
        // {
        //     text: "Utilisateurs & Groupes",
        //     linkProps: {
        //         href: "#",
        //     },
        // },
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
            linkProps: routes.datastore_manage_storage({ datastoreId: currentDatastore._id }).link,
        });
    }

    if (datastoreList.length > 0) {
        const datastoreLinks: MainNavigationProps.Item.Menu = {
            text: currentDatastore?.name ?? t("choose"),
            menuLinks:
                datastoreList?.map((datastore) => ({
                    linkProps: routes.datasheet_list({ datastoreId: datastore._id }).link,
                    text: datastore.name,
                    isActive: datastore._id === currentDatastore?._id,
                })) || [],
        };

        datastoreLinks.menuLinks.push({
            text: t("create_request"),
            linkProps: routes.datastore_create_request().link,
        });
        navItems.push(datastoreLinks);
    }

    if (user !== null) {
        navItems.push({
            text: t("my_account"),
            linkProps: routes.my_account().link,
        });
    }

    return navItems;
};

// traductions
export const { i18n } = declareComponentKeys<"dashboard" | "data" | "members" | "manage_storage" | "choose" | "create_request" | "my_account">()(
    "datastoreNavItems"
);

export const datastoreNavItemsFrTranslations: Translations<"fr">["datastoreNavItems"] = {
    dashboard: "Tableau de bord",
    data: "Données",
    members: "Membres",
    manage_storage: "Gérer l'espace de travail",
    choose: "Choisir un espace de travail",
    create_request: "Demande de création d'un espace de travail",
    my_account: "Mon compte",
};

export const datastoreNavItemsEnTranslations: Translations<"en">["datastoreNavItems"] = {
    dashboard: undefined,
    data: undefined,
    members: undefined,
    manage_storage: undefined,
    choose: undefined,
    create_request: undefined,
    my_account: undefined,
};
