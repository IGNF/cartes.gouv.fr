import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { editMode: boolean }; R: string }
    | { K: "step"; P: { num: number }; R: string }
    | "services"
    | "key_name"
    | "key_type"
    | "ip_list.label"
    | "ip_list.hintText"
    | "ip_list.whitelist"
    | "ip_list.blacklist"
    | "ip_adresses"
    | "iprange_explain"
    | "user_agent"
    | "referer"
    | "login"
    | "password"
    | "apikey"
    | "name_required"
    | "name_exists"
    | "accesses_required"
    | "login_required"
    | "password_required"
    | "apikey_required"
    | { K: "ip_error"; P: { ip: string }; R: string }
    | "no_permission"
>()("UserKey");

export const UserKeyFrTranslations: Translations<"fr">["UserKey"] = {
    title: ({ editMode }) => (editMode ? "Modification d'une clé" : "Ajout d'une clé"),
    step: ({ num }) => (num === 1 ? "Services accessibles" : "Options de sécurisation"),
    services: "Services",
    key_name: "Nom de la clé",
    key_type: "Type",
    "ip_list.label": "Filtrage par IP (optionnel)",
    "ip_list.hintText":
        "Vous pouvez limiter les adresses IP qui pourront utiliser cette clé en listant soit les adresses autorisées (liste blanche), soit les adresses interdites (liste noire)",
    "ip_list.whitelist": "Liste blanche",
    "ip_list.blacklist": "Liste noire",
    ip_adresses: "Adresses IP",
    iprange_explain: "Cette plage d'IP doit être au format CIDR (exemples: 192.168.1.1/32, 192.168.0.1/24)",
    user_agent: "User-agent (optionnel)",
    referer: "Referer (optionnel)",
    login: "Nom d'utilisateur",
    password: "Mot de passe",
    apikey: "Hash",
    name_required: "Le nom de la clé est obligatoire",
    name_exists: "Une clé avec ce nom existe déjà",
    accesses_required: "Veuillez choisir au moins un accès à un service",
    login_required: "Le nom d'utilisateur est obligatoire",
    password_required: "Le mot de passe est obligatoire",
    apikey_required: "Hash est obligatoire",
    ip_error: ({ ip }) => `la plage d'adresses IP [${ip}] n'est pas correcte`,
    no_permission: "Vous n'avez aucune permission, vous ne pouvez pas créer une clé",
};

export const UserKeyEnTranslations: Translations<"en">["UserKey"] = {
    title: ({ editMode }) => (editMode ? "Modify key" : "Add key"),
    step: ({ num }) => (num === 1 ? "Accessible services" : "Security options"),
    services: "Services",
    key_name: "Key name",
    key_type: "Key type",
    "ip_list.label": "Filtering by IP (optional)",
    "ip_list.hintText":
        "You can limit the IP addresses that can use this key by listing either the authorized addresses (white list) or the prohibited addresses (black list)",
    "ip_list.whitelist": "Whitelist",
    "ip_list.blacklist": "Blacklist",
    ip_adresses: "IP Adresses",
    iprange_explain: "This IP range must be in CIDR format (examples: 192.168.1.1/32, 192.168.0.1/24)",
    user_agent: "User-agent (optional)",
    referer: "Referer (optional)",
    login: "Login",
    password: "Password",
    apikey: "Hash",
    name_required: "Key name is mandatory",
    name_exists: "A key with this name already exists",
    accesses_required: "Please choose at least one access to a service",
    login_required: "Login is mandatory",
    password_required: "Password is mandatory",
    apikey_required: "Hash is mandatory",
    ip_error: ({ ip }) => `IP address range [${ip}] is not correct`,
    no_permission: "You have no permissions, you cannot create a key",
};