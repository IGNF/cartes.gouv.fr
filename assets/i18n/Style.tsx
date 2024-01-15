import { declareComponentKeys, type Translations } from "./i18n";

export const { i18n } = declareComponentKeys<
    { K: "add_file"; P: { format: string }; R: string } | { K: "select_file"; P: { format: string }; R: string } | "remove_style"
>()("Style");

export const StyleFrTranslations: Translations<"fr">["Style"] = {
    add_file: ({ format }) => `Ajouter un fichier ${format} par couche présente dans votre service`,
    select_file: ({ format }) => `Sélectionner un fichier au format ${format}`,
    remove_style: "Supprimer le style",
};

export const StyleEnTranslations: Translations<"en">["Style"] = {
    add_file: ({ format }) => `Add ${format} file per layer present in your service`,
    select_file: ({ format }) => `Select file in format ${format}`,
    remove_style: "Remove style",
};
