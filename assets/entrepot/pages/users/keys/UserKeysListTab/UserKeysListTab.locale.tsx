import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "no_keys"
    | "no_permission_warning"
    | { K: "hash_value"; P: { value?: string }; R: string }
    | "hash_value_copied"
    | "services"
    | "no_services"
    | "add"
    | "modify"
    | "remove"
    | "confirm_remove"
>()("UserKeysListTab");
export type I18n = typeof i18n;

export const UserKeysListTabFrTranslations: Translations<"fr">["UserKeysListTab"] = {
    no_keys: "Vous n'avez aucune clé d’accès",
    no_permission_warning: "Vous n'avez aucune permission, il n'est pas possible d’ajouter une clé",
    hash_value: ({ value }) => `Valeur du hash : ${value ?? "indisponible"}`,
    hash_value_copied: "Valeur du hash copiée",
    services: "Services accessibles",
    no_services: "Cette clé n'a accès à aucun service",
    add: "Créer une clé d’accès",
    modify: "Modifier la clé",
    remove: "Supprimer la clé",
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cette clé ?",
};

export const UserKeysListTabEnTranslations: Translations<"en">["UserKeysListTab"] = {
    no_keys: "You don't have any access keys",
    no_permission_warning: "You have no permissions, it is not possible to add a key",
    hash_value: ({ value }) => `Hash value : ${value}`,
    hash_value_copied: "Hash value copied",
    services: "Accessible services",
    no_services: "This key does not have access to any services",
    add: "Create access key",
    modify: "Modify key",
    remove: "Remove key",
    confirm_remove: "Are you sure you want to delete this key ?",
};
