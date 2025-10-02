import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | "title"
    | "services"
    | "no_permissions"
    | { K: "explain_no_permissions"; R: JSX.Element }
    | "consult_documentation"
    | "discover_workspaces"
    | "explain_permissions"
    | "sorting"
    | "type_sorting"
    | "alphabetical_order"
    | "reverse_alphabetical_order"
    | "latest_date"
    | "oldest_date"
    | "active_permissions"
    | "permissions_expired"
    | { K: "expired"; P: { date: string | null }; R: string }
    | { K: "expires_on"; P: { date: string }; R: string }
    | { K: "permission_expires_on"; P: { date: string }; R: string }
    | { K: "permission_granted_by"; P: { name: string }; R: string }
>()("Permissions");
export type I18n = typeof i18n;

export const PermissionsFrTranslations: Translations<"fr">["Permissions"] = {
    title: "Permissions",
    services: "Services",
    no_permissions: "Vous n’avez pas de permissions.",
    explain_no_permissions: (
        <>
            {"Les permissions sont des autorisation de producteurs de données publiques ou privées qui vous sont accordées pour exploiter leurs données."}
            <br />
            <p>{"Pour obtenir ces permissions, rejoingnez des espaces de travail."}</p>
        </>
    ),
    consult_documentation: "Consulter la documentation",
    discover_workspaces: "Découvrir les espaces de travail",
    explain_permissions:
        "Consulter les permissions qui vous ont été octroyées par les producteurs de données, leurs services associés et leur date d'expiration.",
    sorting: "Tri",
    type_sorting: "Filtrer par type",
    alphabetical_order: "Ordre alphabétique de A à Z",
    reverse_alphabetical_order: "Ordre alphabétique de Z à A",
    latest_date: "Date d'expiration la plus récente",
    oldest_date: "Date d'expiration la plus ancienne",
    active_permissions: "Permissions actives",
    permissions_expired: "Permissions expirées",
    expired: ({ date }) => (date ? `A expiré le ${date}` : "A expirée"),
    expires_on: ({ date }) => `Expire le ${date}`,
    permission_expires_on: ({ date }) => `Cette permission expire le ${date}`,
    permission_granted_by: ({ name }) => `Permission accordée par ${name}`,
};

export const PermissionsEnTranslations: Translations<"en">["Permissions"] = {
    title: "Permissions",
    services: "Services",
    no_permissions: "You have no permissions.",
    explain_no_permissions: (
        <>
            {"Permissions are authorisations granted by public or private data producers to use their data."}
            <br />
            <p>{"To obtain these permissions, join workspaces."}</p>
        </>
    ),
    consult_documentation: "Consult the documentation",
    discover_workspaces: "Discover the workspaces",
    explain_permissions: "View the permissions granted to you by data producers, their associated services, and their expiry dates.",
    sorting: "Sorting",
    type_sorting: undefined,
    alphabetical_order: "Alphabetical order from A to Z",
    reverse_alphabetical_order: "Alphabetical order from Z to A",
    latest_date: "Latest expiry date",
    oldest_date: "Oldest expiry date",
    active_permissions: "Active permissions",
    permissions_expired: "Permissions expired",
    expired: ({ date }) => (date ? `Expired on ${date}` : "Expired"),
    expires_on: ({ date }) => `Expires on ${date})`,
    permission_expires_on: ({ date }) => `Permission expires on ${date}`,
    permission_granted_by: ({ name }) => `Permission granted by ${name}`,
};
