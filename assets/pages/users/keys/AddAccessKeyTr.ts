import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | "title"
    | "key_name"
    | "key_type"
    | "key_whitelist"
    | "key_blacklist"
    | "login"
    | "password"
    | "apikey"
    | "add_header"
    | "name_required"
    | "login_required"
    | "password_required"
    | "apikey_required"
    | { K: "ip_error"; P: { ip: string }; R: string }
>()("AddAccessKey");

export const AddAccessKeyFrTranslations: Translations<"fr">["AddAccessKey"] = {
    title: "Ajout d'une clé",
    key_name: "Nom de la clé",
    key_type: "Type",
    key_whitelist: "Liste des adresses IP autorisées",
    key_blacklist: "Liste des adresses IP interdites",
    login: "Nom d'utilisateur",
    password: "Mot de passe",
    apikey: "Clé d'API",
    add_header: "Ajouter un en-tête",
    name_required: "Le nom de la clé est obligatoire",
    login_required: "Le nom d'utilisateur est obligatoire",
    password_required: "Le mot de passe est obligatoire",
    apikey_required: "La clé d'API est obligatoire",
    ip_error: ({ ip }) => `l'adresse IP [${ip}] n'est pas correcte`,
};

export const AddAccessKeyEnTranslations: Translations<"en">["AddAccessKey"] = {
    title: "My access keys",
    key_name: "Key name",
    key_type: "Key type",
    key_whitelist: "IP whitelist",
    key_blacklist: "IP blacklist",
    login: "Login",
    password: "Password",
    apikey: "API key",
    add_header: "Adding header",
    name_required: "Key name is mandatory",
    login_required: "Login is mandatory",
    password_required: "Password is mandatory",
    apikey_required: "API key is mandatory",
    ip_error: ({ ip }) => `IP address [${ip}] is not correct`,
};
