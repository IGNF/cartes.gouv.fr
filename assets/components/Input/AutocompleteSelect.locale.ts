import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"no_options">()("AutocompleteSelect");
export type I18n = typeof i18n;

export const AutocompleteSelectFrTranslations: Translations<"fr">["AutocompleteSelect"] = {
    no_options: "Aucune option trouvée",
};

export const AutocompleteSelectEnTranslations: Translations<"en">["AutocompleteSelect"] = {
    no_options: "No options found",
};
