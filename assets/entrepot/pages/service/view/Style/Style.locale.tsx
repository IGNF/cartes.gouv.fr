import { declareComponentKeys } from "../../../../../i18n";
import { type Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "my_styles"
    | "modify"
    | "add_style"
    | "edit_style"
    | { K: "add_file"; P: { format: string }; R: string }
    | { K: "select_file"; P: { format: string }; R: string }
    | "remove_style"
    | { K: "remove_style_confirmation"; P: { styleName: string | undefined }; R: string }
>()("Style");
export type I18n = typeof i18n;

export const StyleFrTranslations: Translations<"fr">["Style"] = {
    my_styles: "Mes styles",
    modify: "Modifier",
    add_style: "Ajouter un style",
    edit_style: "Editer le style",
    add_file: ({ format }) => `Ajouter un fichier ${format} par couche présente dans votre service`,
    select_file: ({ format }) => `Sélectionner un fichier au format ${format}`,
    remove_style: "Supprimer le style",
    remove_style_confirmation: ({ styleName }) =>
        styleName !== undefined ? `Êtes-vous sûr de vouloir supprimer le style ${styleName} ?` : "Êtes-vous sûr de vouloir supprimer ce style ?",
};

export const StyleEnTranslations: Translations<"en">["Style"] = {
    my_styles: "My styles",
    modify: "Modify",
    add_style: "Add style",
    edit_style: "Edit style",
    add_file: ({ format }) => `Add ${format} file per layer present in your service`,
    select_file: ({ format }) => `Select file in format ${format}`,
    remove_style: "Delete style",
    remove_style_confirmation: ({ styleName }) =>
        styleName !== undefined ? `Are you sure you want to remove the style ${styleName}` : "Are you sure you want to remove this style",
};
