import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";
import { StatsScope } from "./statsConfig";

const { i18n } = declareComponentKeys<"scope_selection_title" | { K: "scope_title"; P: { scope: StatsScope }; R: string }>()("Stats");
export type I18n = typeof i18n;

export const StatsFrTranslations: Translations<"fr">["Stats"] = {
    scope_selection_title: "Statistiques",
    scope_title: ({ scope }) => {
        switch (scope) {
            case "datastore":
                return "Statistiques de l’entrepôt";
            case "community":
                return "Statistiques de la communauté";
            case "user":
                return "Mes statistiques";
            default:
                return scope;
        }
    },
};
export const StatsEnTranslations: Translations<"en">["Stats"] = {
    scope_selection_title: undefined,
    scope_title: undefined,
};
