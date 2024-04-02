import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { keyId: string | undefined }; R: string }
    | { K: "step"; P: { num: number }; R: string }
    | "services"
    | "key_name"
    | "key_type"
    | "ip_list.label"
    | "ip_list.hintText"
    | "ip_list.whitelist"
    | "ip_list.blacklist"
    | "ip_addresses"
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
    | "apikey_error"
    | "apikey_min_error"
    | "apikey_max_error"
    | { K: "ip_error"; P: { ip: string }; R: string }
    | "no_permission"
    | "key_not_found"
>()("UserKey");

export const UserKeyFrTranslations: Translations<"fr">["UserKey"] = {
    title: ({ keyId }) => (keyId ? `Modification de la clé ${keyId}` : "Ajout d'une clé"),
    step: ({ num }) => (num === 1 ? "Services accessibles" : "Options de sécurisation"),
    services: "Services",
    key_name: "Nom de la clé",
    key_type: "Type",
    "ip_list.label": "Filtrage par IP (optionnel)",
    "ip_list.hintText":
        "Vous pouvez limiter les adresses IP qui pourront utiliser cette clé en listant soit les adresses autorisées (liste blanche), soit les adresses interdites (liste noire)",
    "ip_list.whitelist": "Liste blanche",
    "ip_list.blacklist": "Liste noire",
    ip_addresses: "Adresses IP",
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
    apikey_error: "Les caractères autorisés pour le hash sont les chiffres, lettres, _, - et .",
    apikey_min_error: "Le hash doit faire au minimum 4 caractères",
    apikey_max_error: "Le hash doit faire au maximum 64 caractères",
    ip_error: ({ ip }) => `la plage d'adresses IP [${ip}] n'est pas correcte`,
    no_permission: "Volus n'avez aucune permission, vous ne pouvez pas créer une clé",
    key_not_found: "Cette clé n'a pas été trouvée",
};

export const UserKeyEnTranslations: Translations<"en">["UserKey"] = {
    title: ({ keyId }) => (keyId ? `Modify key ${keyId}` : "Add key"),
    step: ({ num }) => (num === 1 ? "Accessible services" : "Security options"),
    services: "Services",
    key_name: "Key name",
    key_type: "Key type",
    "ip_list.label": "Filtering by IP (optional)",
    "ip_list.hintText":
        "You can limit the IP addresses that can use this key by listing either the authorized addresses (white list) or the prohibited addresses (black list)",
    "ip_list.whitelist": "Whitelist",
    "ip_list.blacklist": "Blacklist",
    ip_addresses: "IP Adresses",
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
    apikey_error: "The allowed characters for the hash are numbers, letters, _, - and .",
    apikey_min_error: "The hash must be at least 4 characters long",
    apikey_max_error: "The hash must be a maximum of 64 characters",
    ip_error: ({ ip }) => `IP address range [${ip}] is not correct`,
    no_permission: "You have no permissions, you cannot create a key",
    key_not_found: "Key not found",
};
