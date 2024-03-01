import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | "title"
    | "key_name"
    | "key_type"
    | "key_whitelist"
    | "key_blacklist"
    | "key_iprange_explain"
    | "user_agent"
    | "referer"
    | "login"
    | "password"
    | "apikey"
    | "name_required"
    | "name_exists"
    | "login_required"
    | "password_required"
    | "apikey_required"
    | { K: "ip_error"; P: { ip: string }; R: string }
>()("AddAccessKey");

export const AddAccessKeyFrTranslations: Translations<"fr">["AddAccessKey"] = {
    title: "Ajout d'une clé",
    key_name: "Nom de la clé",
    key_type: "Type",
    key_whitelist: "Plages d'adresses IP autorisées (optionnel)",
    key_blacklist: "Plages d'adresses IP interdites (optionnel)",
    key_iprange_explain: "Doit correspondre à une plage d'IP au format CIDR",
    user_agent: "User-agent (optionnel)",
    referer: "Referer (optionnel)",
    login: "Nom d'utilisateur",
    password: "Mot de passe",
    apikey: "Hash",
    name_required: "Le nom de la clé est obligatoire",
    name_exists: "Une clé avec ce nom existe déjà",
    login_required: "Le nom d'utilisateur est obligatoire",
    password_required: "Le mot de passe est obligatoire",
    apikey_required: "Hash est obligatoire",
    ip_error: ({ ip }) => `la plage d'adresses IP [${ip}] n'est pas correcte`,
};

export const AddAccessKeyEnTranslations: Translations<"en">["AddAccessKey"] = {
    title: "My access keys",
    key_name: "Key name",
    key_type: "Key type",
    key_whitelist: "Allowed IP address ranges (optional)",
    key_blacklist: "Prohibited IP address ranges (optional)",
    key_iprange_explain: "Must match an IP range in CIDR format",
    user_agent: "User-agent (optional)",
    referer: "Referer (optional)",
    login: "Login",
    password: "Password",
    apikey: "Hash",
    name_required: "Key name is mandatory",
    name_exists: "A key with this name already exists",
    login_required: "Login is mandatory",
    password_required: "Password is mandatory",
    apikey_required: "Hash is mandatory",
    ip_error: ({ ip }) => `IP address range [${ip}] is not correct`,
};
