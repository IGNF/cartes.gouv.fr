import { declareComponentKeys, type Translations } from "./i18n";

export const { i18n } = declareComponentKeys<
    | "my_styles"
    | "add_style"
    | { K: "add_file"; P: { format: string }; R: string }
    | { K: "select_file"; P: { format: string }; R: string }
    | { K: "remove_style"; P: { styleName: string | undefined }; R: string }
    | "qml_message"
>()("Style");

export const StyleFrTranslations: Translations<"fr">["Style"] = {
    my_styles: "Mes styles :",
    add_style: "Ajouter un style",
    add_file: ({ format }) => `Ajouter un fichier ${format} par couche présente dans votre service`,
    select_file: ({ format }) => `Sélectionner un fichier au format ${format}`,
    remove_style: ({ styleName }) =>
        styleName !== undefined ? `Êtes-vous sûr de vouloir supprimer le style ${styleName} ?` : "Êtes-vous sûr de vouloir supprimer ce style ?",
    qml_message: "Les fichiers qml générés avec une version de QGIS > 3.28 ne sont pas encore compatibles",
};

export const StyleEnTranslations: Translations<"en">["Style"] = {
    my_styles: "My styles :",
    add_style: "Add style",
    add_file: ({ format }) => `Add ${format} file per layer present in your service`,
    select_file: ({ format }) => `Select file in format ${format}`,
    remove_style: ({ styleName }) =>
        styleName !== undefined ? `Are you sure you want to remove the style ${styleName}` : "Are you sure you want to remove this style",
    qml_message: "qml files generated with QGIS version > 3.28 are not yet compatible",
};
