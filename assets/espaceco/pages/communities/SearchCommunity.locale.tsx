import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

// traductions
const { i18n } = declareComponentKeys<"default_label" | "default_placeholder" | "no_options" | "loading">()("SearchCommunity");
export type I18n = typeof i18n;

export const SearchCommunityFrTranslations: Translations<"fr">["SearchCommunity"] = {
    default_label: "Nom du guichet :",
    default_placeholder: "Recherche du guichet par son nom",
    no_options: "Aucun guichet",
    loading: "Recherche en cours ...",
};

export const SearchCommunityEnTranslations: Translations<"en">["SearchCommunity"] = {
    default_label: undefined,
    default_placeholder: undefined,
    no_options: undefined,
    loading: undefined,
};
