import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../i18n/types";

const { i18n } = declareComponentKeys<
    "dashboard" | "data" | "members" | "manage_storage" | "consumption_monitoring" | "permissions_granted" | "my_account" | "my_access_keys"
>()("datastoreNavItems");
export type I18n = typeof i18n;

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
