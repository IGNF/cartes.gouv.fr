import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<"title" | "my_access_keys" | "add_access_keys" | "my_permissions" | "burger_menu">()("MyAccessKeys");
export type I18n = typeof i18n;

export const MyAccessKeysFrTranslations: Translations<"fr">["MyAccessKeys"] = {
    title: "Clés d’accès",
    my_access_keys: "Mes clés d’accès",
    add_access_keys: "Créer une clé d’accès",
    my_permissions: "Mes permissions",
    burger_menu: "Dans cette rubrique",
};

export const MyAccessKeysEnTranslations: Translations<"en">["MyAccessKeys"] = {
    title: "Access keys",
    my_access_keys: "My keys",
    add_access_keys: "Create access key",
    my_permissions: "My permissions",
    burger_menu: "In this section",
};
