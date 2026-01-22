import { declareComponentKeys } from "../../../../i18n/i18n";
import { Translations } from "../../../../i18n/types";

// traductions
const { i18n } = declareComponentKeys<"loading_tables" | "loading_shared_themes" | "loading_email_planners">()("Reports");
export type I18n = typeof i18n;

export const ReportsFrTranslations: Translations<"fr">["Reports"] = {
    loading_tables: "Recherche des tables pour la configuration des thèmes ...",
    loading_shared_themes: "Recherche des thèmes partagés ...",
    loading_email_planners: "Recherche des courriels de suivi ...",
};

export const ReportsEnTranslations: Translations<"en">["Reports"] = {
    loading_tables: undefined,
    loading_shared_themes: undefined,
    loading_email_planners: undefined,
};
