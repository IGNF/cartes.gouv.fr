import { declareComponentKeys } from "../../../../../i18n";
import { type Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    "my_styles" | "edit_style" | "remove_style" | { K: "remove_style_confirmation"; P: { styleName: string | undefined }; R: string }
>()("Style");
export type I18n = typeof i18n;

export const StyleFrTranslations: Translations<"fr">["Style"] = {
    my_styles: "Mes styles",
    edit_style: "Editer le style",
    remove_style: "Supprimer le style",
    remove_style_confirmation: ({ styleName }) =>
        styleName !== undefined ? `Êtes-vous sûr de vouloir supprimer le style ${styleName} ?` : "Êtes-vous sûr de vouloir supprimer ce style ?",
};

export const StyleEnTranslations: Translations<"en">["Style"] = {
    my_styles: "My styles",
    edit_style: "Edit style",
    remove_style: "Delete style",
    remove_style_confirmation: ({ styleName }) =>
        styleName !== undefined ? `Are you sure you want to remove the style ${styleName}` : "Are you sure you want to remove this style",
};
