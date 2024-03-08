import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | "title"
    | "services"
    | "no_permission"
    | "expired"
    | { K: "expires_on"; P: { date: string }; R: string }
    | { K: "permission_expires_on"; P: { date: string }; R: string }
    | { K: "permission_granted_by"; P: { name: string }; R: string }
>()("Permissions");

export const PermissionsFrTranslations: Translations<"fr">["Permissions"] = {
    title: "Permissions",
    services: "Services",
    no_permission: "Vous n'avez aucune permission",
    expired: "Expirée",
    expires_on: ({ date }) => `Expire le ${date}`,
    permission_expires_on: ({ date }) => `Cette permission expire le ${date}`,
    permission_granted_by: ({ name }) => `Permission accordée par ${name}`,
};

export const PermissionsEnTranslations: Translations<"en">["Permissions"] = {
    title: "Permissions",
    services: "Services",
    no_permission: "You have no permission",
    expired: "Expired",
    expires_on: ({ date }) => `Expires on ${date})`,
    permission_expires_on: ({ date }) => `Permission expires on ${date}`,
    permission_granted_by: ({ name }) => `Permission granted by ${name}`,
};
