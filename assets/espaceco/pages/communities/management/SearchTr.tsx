import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<"no_results" | "loading">()("Search");

export const SearchFrTranslations: Translations<"fr">["Search"] = {
    no_results: "Aucun résultat",
    loading: "Recherche en cours ...",
};

export const SearchEnTranslations: Translations<"en">["Search"] = {
    no_results: "No results",
    loading: "Searching ...",
};
