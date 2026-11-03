import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"expired_title" | "expired_description" | "reconnect">()("SessionAlert");
export type I18n = typeof i18n;

export const SessionAlertFrTranslations: Translations<"fr">["SessionAlert"] = {
    expired_title: "Session expirée",
    expired_description: "Reconnectez-vous pour reprendre là où vous en étiez : la page reste telle quelle.",
    reconnect: "Se reconnecter",
};

export const SessionAlertEnTranslations: Translations<"en">["SessionAlert"] = {
    expired_title: "Session expired",
    expired_description: "Sign in again to pick up where you left off: the page stays as it is.",
    reconnect: "Sign in again",
};
