import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"no_options" | "loading" | { K: "min_chars"; P: { minChars: number }; R: string }>()("AutocompleteSelect");
export type I18n = typeof i18n;

export const AutocompleteSelectFrTranslations: Translations<"fr">["AutocompleteSelect"] = {
    no_options: "Aucune option trouvée",
    loading: "Chargement…",
    min_chars: ({ minChars }) => `Saisissez au moins ${minChars} caractère${minChars > 1 ? "s" : ""}`,
};

export const AutocompleteSelectEnTranslations: Translations<"en">["AutocompleteSelect"] = {
    no_options: "No options found",
    loading: "Loading…",
    min_chars: ({ minChars }) => `Type at least ${minChars} character${minChars > 1 ? "s" : ""}`,
};
