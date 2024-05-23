import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/i18n";
import { UserKeyInfoDtoTypeEnum } from "../../../../@types/app";

// traductions
export const { i18n } = declareComponentKeys<
    | { K: "title"; P: { keyId: string | undefined }; R: string }
    | { K: "step"; P: { num: number }; R: string }
    | "services"
    | "key_name"
    | "key_explain"
    | "key_type"
    | { K: "hash_type_explain"; R: JSX.Element }
    | { K: "basic_type_explain"; R: JSX.Element }
    | { K: "oauth2_type_explain"; R: JSX.Element }
    | { K: "key_is_type"; P: { type: UserKeyInfoDtoTypeEnum }; R: JSX.Element }
    | "ip_list.label"
    | "ip_list.hintText"
    | "ip_list.no_filter"
    | "ip_list.whitelist"
    | "ip_list.blacklist"
    | "ip_addresses"
    | "iprange_explain"
    | "user_agent"
    | "user_agent_hintext"
    | "referer"
    | "referer_hintext"
    | "login"
    | "password"
    | "name_required"
    | "name_exists"
    | "accesses_required"
    | "login_required"
    | "password_required"
    | { K: "ip_error"; P: { ip: string }; R: string }
    | "no_permission"
    | "key_not_found"
>()("UserKey");

export const UserKeyFrTranslations: Translations<"fr">["UserKey"] = {
    title: ({ keyId }) => (keyId ? `Modification de la clé ${keyId}` : "Ajout d'une clé"),
    step: ({ num }) => (num === 1 ? "Services accessibles" : "Options de sécurisation"),
    services: "Services",
    key_name: "Nom de la clé",
    key_explain: "Dénomination de votre clé vous permettant de la reconnaitre parmi celles que vous aurez créées.",
    key_type: "Type",
    hash_type_explain: (
        <p>
            {
                "Une valeur de hash (chaine de caractère) sera calculée automatiquement et devra être fournie comme paramètre supplémentaire dans les requêtes de consultation des flux. Ce type d'authentification est adapté en particulier pour une utilisation sur un site internet."
            }
        </p>
    ),
    basic_type_explain: (
        <p>
            {
                "Définissez un nom d'utilisateur et un mot de passe utilisables pour consulter les flux. Ce type d'authentification est adapté pour une utilisation sous SIG."
            }
        </p>
    ),
    oauth2_type_explain: (
        <p>
            {
                "Ce type d'authentification consiste à utiliser votre compte Géoplateforme. Vous ne pouvez donc avoir qu'une seule clé de ce type. Ce type est adapté pour une utilisation dans un logiciel SIG ou tout outil nécessitant une authentification forte. "
            }
        </p>
    ),
    key_is_type: ({ type }) => <p>{`Cette clé est de type ${type}`}</p>,
    "ip_list.label": "Filtrage par IP (optionnel)",
    "ip_list.hintText":
        "Vous pouvez limiter les adresses IP qui pourront utiliser cette clé en listant soit les adresses autorisées (liste blanche), soit les adresses interdites (liste noire)",
    "ip_list.no_filter": "Pas de filtrage",
    "ip_list.whitelist": "Liste blanche",
    "ip_list.blacklist": "Liste noire",
    ip_addresses: "Adresses IP",
    iprange_explain: "Cette plage d'IP doit être au format CIDR (exemples: 192.168.1.1/32, 192.168.0.1/24)",
    user_agent: "User-agent (optionnel)",
    user_agent_hintext: "Code associé à votre application cliente",
    referer: "Referer (optionnel)",
    referer_hintext: "En-tête des requêtes permettant d'identifier votre site internet",
    login: "Nom d'utilisateur",
    password: "Mot de passe",
    name_required: "Le nom de la clé est obligatoire",
    name_exists: "Une clé avec ce nom existe déjà",
    accesses_required: "Veuillez choisir au moins un accès à un service",
    login_required: "Le nom d'utilisateur est obligatoire",
    password_required: "Le mot de passe est obligatoire",
    ip_error: ({ ip }) => `la plage d'adresses IP [${ip}] n'est pas correcte`,
    no_permission: "Vous n'avez aucune permission, vous ne pouvez pas créer une clé",
    key_not_found: "Cette clé n'a pas été trouvée",
};

export const UserKeyEnTranslations: Translations<"en">["UserKey"] = {
    title: ({ keyId }) => (keyId ? `Modify key ${keyId}` : "Add key"),
    step: ({ num }) => (num === 1 ? "Accessible services" : "Security options"),
    services: "Services",
    key_name: "Key name",
    key_explain: "Name of your key allowing you to recognize it among those you have created.",
    key_type: "Key type",
    hash_type_explain: <p>{"Set a username and password that you can use to view feeds. This type of authentication is suitable for use under GIS."}</p>,
    basic_type_explain: (
        <p>
            {
                "A hash value (character string) will be calculated automatically and must be provided as an additional parameter in feed consultation requests. This type of authentication is particularly suitable for use on a website."
            }
        </p>
    ),
    oauth2_type_explain: (
        <p>
            {
                "This type of authentication consists of using your Geoplatform account. So you can only have one such key. This type is suitable for use in GIS software or any tool requiring strong authentication."
            }
        </p>
    ),
    key_is_type: ({ type }) => <p>{`This key is of type ${type}`}</p>,
    "ip_list.label": "Filtering by IP (optional)",
    "ip_list.hintText":
        "You can limit the IP addresses that can use this key by listing either the authorized addresses (white list) or the prohibited addresses (black list)",
    "ip_list.no_filter": "No filter",
    "ip_list.whitelist": "Whitelist",
    "ip_list.blacklist": "Blacklist",
    ip_addresses: "IP Adresses",
    iprange_explain: "This IP range must be in CIDR format (examples: 192.168.1.1/32, 192.168.0.1/24)",
    user_agent: "User-agent (optional)",
    user_agent_hintext: undefined,
    referer: "Referer (optional)",
    referer_hintext: undefined,
    login: "Login",
    password: "Password",
    name_required: "Key name is mandatory",
    name_exists: "A key with this name already exists",
    accesses_required: "Please choose at least one access to a service",
    login_required: "Login is mandatory",
    password_required: "Password is mandatory",
    ip_error: ({ ip }) => `IP address range [${ip}] is not correct`,
    no_permission: "You have no permissions, you cannot create a key",
    key_not_found: "Key not found",
};
