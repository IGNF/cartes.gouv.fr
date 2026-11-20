import { declareComponentKeys } from "@/i18n";
import { type Translations } from "@/i18n/types";

const { i18n } = declareComponentKeys<"save" | "saving" | "saved" | "error_title" | "read_only">()("DescriptionTab");

export type I18n = typeof i18n;

export const DescriptionTabFrTranslations: Translations<"fr">["DescriptionTab"] = {
    save: "Enregistrer",
    saving: "Enregistrement en cours",
    saved: "Les modifications ont été enregistrées.",
    error_title: "Les modifications n’ont pas été enregistrées",
    read_only: "Vous n’avez pas les droits pour modifier la description de cette fiche de données.",
};

export const DescriptionTabEnTranslations: Translations<"en">["DescriptionTab"] = {
    save: "Save",
    saving: "Saving",
    saved: "Your changes have been saved.",
    error_title: "Your changes were not saved",
    read_only: "You do not have the rights to edit the description of this datasheet.",
};
