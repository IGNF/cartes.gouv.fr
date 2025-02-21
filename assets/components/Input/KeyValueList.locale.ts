import { declareComponentKeys } from "@/i18n/i18n";
import { Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"has_duplicates_error" | "define_keys">()("KeyValueList");
export type I18n = typeof i18n;

export const KeyValueListFrTranslations: Translations<"fr">["KeyValueList"] = {
    has_duplicates_error: "Supprimer ou corriger les clés/valeurs en double",
    define_keys: "",
};

export const KeyValueListEnTranslations: Translations<"en">["KeyValueList"] = {
    has_duplicates_error: "Remove or fix duplicates keys / values",
    define_keys: "Define keys",
};
