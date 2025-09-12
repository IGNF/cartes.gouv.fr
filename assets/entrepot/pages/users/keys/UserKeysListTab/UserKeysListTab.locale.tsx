import { fr } from "@codegouvfr/react-dsfr";
import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "no_keys"
    | { K: "explain_no_keys"; R: JSX.Element }
    | "consult_documentation"
    | "active_keys"
    | "ip_filtering"
    | "user_agent"
    | "referer"
    | "no_permission_warning"
    | "hash"
    | "unavailable"
    | "hash_value_copied"
    | "wfs_services"
    | "wms_raster_services"
    | "wms_vector_services"
    | "wmts_tms_services"
    | "no_services"
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
            <p className={fr.cx("fr-mb-6v")}>{"* Les données publiques sont disponibles sans création de clé d'accès."}</p>
        </>
    ),
    consult_documentation: "Consulter la documentation",
    active_keys: "Clés actives",
    ip_filtering: "Filtrage par IP",
    user_agent: "User agent",
    referer: "Referer",
    no_permission_warning: "Vous n'avez aucune permission, il n'est pas possible d’ajouter une clé",
    hash: "Hash",
    unavailable: "Indisponible",
    hash_value_copied: "Valeur du hash copiée",
    wfs_services: "Services WFS",
    wms_raster_services: "Services WMS-Raster",
    wms_vector_services: "Services WMS-Vecteur",
    wmts_tms_services: "Services WMTS-TMS",
    no_services: "Cette clé n'a accès à aucun service",
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
    active_keys: "Active keys",
    ip_filtering: "IP filtering",
    user_agent: "User agent",
    referer: "Referer",
    no_permission_warning: "You have no permissions, it is not possible to add a key",
    hash: "Hash",
    unavailable: "Unavailable",
    hash_value_copied: "Hash value copied",
    wfs_services: "WFS services",
    wms_raster_services: "WMS-Raster services",
    wms_vector_services: "WMS-Vector services",
    wmts_tms_services: "WMTS-TMS services",
    no_services: "This key does not have access to any services",
    add: "Create access key",
    modify: "Modify key",
    remove: "Remove key",
    confirm_remove: "Are you sure you want to delete this key ?",
};
