import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<
    | "title"
    | "services"
    | "no_permission"
    | { K: "expired"; P: { date: string | null }; R: string }
    | { K: "expires_on"; P: { date: string }; R: string }
    | { K: "permission_expires_on"; P: { date: string }; R: string }
    | { K: "permission_granted_by"; P: { name: string }; R: string }
>()("Permissions");
export type I18n = typeof i18n;

export const PermissionsFrTranslations: Translations<"fr">["Permissions"] = {
    title: "Permissions",
    services: "Services",
    no_permission: "Vous n'avez aucune permission",
    expired: ({ date }) => (date ? `A expiré le ${date}` : "A expirée"),
    expires_on: ({ date }) => `Expire le ${date}`,
    permission_expires_on: ({ date }) => `Cette permission expire le ${date}`,
    permission_granted_by: ({ name }) => `Permission accordée par ${name}`,
};

export const PermissionsEnTranslations: Translations<"en">["Permissions"] = {
    title: "Permissions",
    services: "Services",
    no_permission: "You have no permission",
    expired: ({ date }) => (date ? `Expired on ${date}` : "Expired"),
    expires_on: ({ date }) => `Expires on ${date})`,
    permission_expires_on: ({ date }) => `Permission expires on ${date}`,
    permission_granted_by: ({ name }) => `Permission granted by ${name}`,
};
