import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "no_keys"
    | { K: "explain_no_keys"; R: JSX.Element }
    | "consult_documentation"
    | "sorting"
    | "type_sorting"
    | "key_limit"
    | "alphabetical_order"
    | "reverse_alphabetical_order"
    | "active_keys"
    | "ip_filtering"
    | "user_agent"
    | "referer"
    | "no_permission_warning"
    | "hash"
    | "unavailable"
    | "hash_value_copied"
    | "available_services"
    | "no_services_status"
    | "no_services_hint"
    | "add"
    | "modify"
    | "remove"
    | "confirm_remove"
>()("UserKeysListTab");
export type I18n = typeof i18n;

export const UserKeysListTabFrTranslations: Translations<"fr">["UserKeysListTab"] = {
    no_keys: "Vous n’avez pas de clés d’accès.",
    explain_no_keys: (
        <>
            <p>
                {
                    "Créer vos clés d’accès et utiliser-les dans vos outils (SIG, site internet, etc.) pour exploiter les permissions qui vous ont été accordées par les producteurs de données."
                }
            </p>
            <p>{"* Les données publiques sont disponibles sans création de clé d’accès."}</p>
        </>
    ),
    consult_documentation: "Consulter la documentation",
    sorting: "Tri",
    type_sorting: "Filtrer par flux",
    key_limit: "Le nombre maximal de clés est de ",
    alphabetical_order: "Ordre alphabétique de A à Z",
    reverse_alphabetical_order: "Ordre alphabétique de Z à A",
    active_keys: "Clés actives",
    ip_filtering: "Filtrage par IP",
    user_agent: "User agent",
    referer: "Referer",
    no_permission_warning: "Vous n'avez aucune permission, il n'est pas possible d’ajouter une clé",
    hash: "Hash",
    unavailable: "Indisponible",
    hash_value_copied: "Valeur du hash copiée",
    available_services: "Services disponibles",
    no_services_status: "Indisponible",
    no_services_hint:
        "Les services associés à cette clé ont été supprimés ou la permission qui vous y donnait accès n'est plus valable. Vous pouvez supprimer cette clé ou la modifier pour l'associer à d'autres services.",
    add: "Créer une clé d’accès",
    modify: "Modifier la clé",
    remove: "Supprimer la clé",
    confirm_remove: "Êtes-vous sûr de vouloir supprimer cette clé ?",
};

export const UserKeysListTabEnTranslations: Translations<"en">["UserKeysListTab"] = {
    no_keys: "You don't have access keys",
    explain_no_keys: (
        <>
            <p>{"Create your access keys and use them in your tools (GIS, website, etc.) to utilise the permissions granted to you by the data producers."}</p>
            <p className={fr.cx("fr-mb-6v")}>{"* Public data is available without creating an access key."}</p>
        </>
    ),
    consult_documentation: "Consult the documentation",
    sorting: "Sorting",
    type_sorting: undefined,
    key_limit: "The maximum number of keys is ",
    alphabetical_order: "Alphabetical order from A to Z",
    reverse_alphabetical_order: "Alphabetical order from Z to A",
    active_keys: "Active keys",
    ip_filtering: "IP filtering",
    user_agent: "User agent",
    referer: "Referer",
    no_permission_warning: "You have no permissions, it is not possible to add a key",
    hash: "Hash",
    unavailable: "Unavailable",
    hash_value_copied: "Hash value copied",
    available_services: "Available services",
    no_services_status: "Unavailable",
    no_services_hint:
        "The services associated with this key have been deleted or the permission that gave you access to them is no longer valid. You can delete this key or modify it to associate it with other services.",
    add: "Create access key",
    modify: "Modify key",
    remove: "Remove key",
    confirm_remove: "Are you sure you want to delete this key ?",
};
