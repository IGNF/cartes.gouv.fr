import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    "title" | "no_permission" | "expired" | { K: "expires_on"; P: { date: string }; R: string } | { K: "permission_expires_on"; P: { date: string }; R: string }
>()("Permissions");

export const PermissionsFrTranslations: Translations<"fr">["Permissions"] = {
    title: "Permissions",
    no_permission: "Vous n'avez aucune permission",
    expired: "Expirée",
    expires_on: ({ date }) => `(expire le ${date})`,
    permission_expires_on: ({ date }) => `Cette permission expire le ${date}`,
};

export const PermissionsEnTranslations: Translations<"en">["Permissions"] = {
    title: "Permissions",
    no_permission: "You have no permission",
    expired: "Expired",
    expires_on: ({ date }) => `(expires on ${date})`,
    permission_expires_on: ({ date }) => `Permission expires on ${date}`,
};
