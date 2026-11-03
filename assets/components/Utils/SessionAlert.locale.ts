import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"expiring_title" | "expiring_description" | "expired_title" | "expired_description" | "reconnect">()("SessionAlert");
export type I18n = typeof i18n;

export const SessionAlertFrTranslations: Translations<"fr">["SessionAlert"] = {
    expiring_title: "Votre session expire bientôt",
    expiring_description: "Reconnectez-vous pour continuer sans perdre votre travail en cours.",
    expired_title: "Session expirée",
    expired_description: "Reconnectez-vous pour reprendre là où vous en étiez : la page reste telle quelle.",
    reconnect: "Se reconnecter",
};

export const SessionAlertEnTranslations: Translations<"en">["SessionAlert"] = {
    expiring_title: "Your session is about to expire",
    expiring_description: "Sign in again to keep working without losing anything.",
    expired_title: "Session expired",
    expired_description: "Sign in again to pick up where you left off: the page stays as it is.",
    reconnect: "Sign in again",
};
