import { declareComponentKeys, Translations } from "../../../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | "add_theme"
    | "add_attribute"
    | "trimmed_error"
    | "attributes_not_conform"
    | { K: "modify_theme"; P: { text: string }; R: string }
    | { K: "delete_theme"; P: { text: string }; R: string }
    | { K: "modify_attribute"; P: { text: string }; R: string }
    | { K: "delete_attribute"; P: { text: string }; R: string }
    | "dialog.add_theme.name"
    | "dialog.add_theme.name_mandatory_error"
    | "dialog.add_theme.name_unique_error"
    | "dialog.add_theme.help"
    | "dialog.add_theme.help_hint"
    | "dialog.add_theme.link_to_table"
    | "dialog.add_theme.link_to_table_hint"
    | "dialog.add_theme.not_link"
    | "dialog.add_theme.global"
    | "dialog.add_theme.global_hint"
    | "dialog.edit_theme.name"
    | "dialog.edit_theme.name_hint"
    | "dialog.edit_theme.name_mandatory_error"
    | "dialog.edit_theme.name_unique_error"
    | "dialog.edit_theme.help"
    | "dialog.edit_theme.global"
    | "dialog.edit_theme.global_hint"
    | "dialog.add_attribute.name"
    | "dialog.add_attribute.mandatory"
    | "dialog.add_attribute.name"
    | "dialog.add_attribute.name_mandatory_error"
    | "dialog.add_attribute.name_unique_error"
    | "dialog.add_attribute.mandatory"
    | "dialog.add_attribute.type"
    | { K: "dialog.add_attribute.get_type"; P: { type: string }; R: string }
    | "dialog.add_attribute.list.multiple"
    | "dialog.add_attribute.list.values"
    | "dialog.add_attribute.value"
    | "dialog.add_attribute.value.not_a_valid_integer"
    | "dialog.add_attribute.value.not_a_valid_double"
    | "dialog.add_attribute.value.not_a_valid_checkbox"
    | "dialog.add_attribute.value.not_a_valid_date"
    | "dialog.add_attribute.type_list_not_empty_error"
    | "dialog.add_attribute.list_duplicates_error"
    | "dialog.add_attribute.value_not_in_list_error"
    | "dialog.add_attribute.description"
    | "dialog.edit_attribute.name"
    | "dialog.edit_attribute.name_mandatory_error"
    | "dialog.edit_attribute.name_unique_error"
    | "dialog.edit_attribute.mandatory"
    | "dialog.edit_attribute.list.multiple"
    | "dialog.edit_attribute.list.values"
    | "dialog.edit_attribute.value"
    | "dialog.edit_attribute.description"
>()("Theme");

export const ThemeFrTranslations: Translations<"fr">["Theme"] = {
    add_theme: "Ajouter un thème",
    add_attribute: "Ajouter un attribut",
    trimmed_error: "La chaîne de caractères ne doit contenir aucun espace en début et fin",
    attributes_not_conform: "Les attributs ne sont pas conformes",
    modify_theme: ({ text }) => `Modifier le thème [${text}]`,
    delete_theme: ({ text }) => `Supprimer le thème [${text}]`,
    modify_attribute: ({ text }) => `Modifier l'attribut [${text}]`,
    delete_attribute: ({ text }) => `Supprimer l'attribut [${text}]`,
    "dialog.add_theme.name": "Nom du thème",
    "dialog.add_theme.name_mandatory_error": "Le nom du thème est obligatoire",
    "dialog.add_theme.name_unique_error": "Le nom doit être unique",
    "dialog.add_theme.help": "Texte d'aide (optionnel)",
    "dialog.add_theme.help_hint": "Cette description aidera les membres à décrire plus précisément leur signalement",
    "dialog.add_theme.link_to_table": "Lier le thème à une base de données et à une table",
    "dialog.add_theme.link_to_table_hint": "Un thème lié à une base de données et à une table ne pourra pas être modifié",
    "dialog.add_theme.not_link": "Ne pas lier à une table",
    "dialog.add_theme.global": "Partage",
    "dialog.add_theme.global_hint": "Partager ce thème le rendra visible et sélectionnable pour des signalement non liés à des guichets",
    "dialog.edit_theme.name": "Nouveau nom",
    "dialog.edit_theme.name_hint":
        "Attention, si vous modifiez le nom du thème, les utilisateurs devront recocher le thème dans leur profil pour y avoir accès.",
    "dialog.edit_theme.name_mandatory_error": "Le nom du thème est obligatoire",
    "dialog.edit_theme.name_unique_error": "Le nom doit être unique",
    "dialog.edit_theme.help": "Nouvelle description (optionnel)",
    "dialog.edit_theme.global": "Partage",
    "dialog.edit_theme.global_hint": "Partager ce thème le rendra visible et sélectionnable pour des signalement non liés à des guichets",
    "dialog.add_attribute.name": "Nom de l'attribut",
    "dialog.add_attribute.mandatory": "Attribut obligatoire",
    "dialog.add_attribute.name_mandatory_error": "Le nom de l'attribut est obligatoire",
    "dialog.add_attribute.name_unique_error": "Le nom doit être unique",
    "dialog.add_attribute.type": "Type",
    "dialog.add_attribute.get_type": ({ type }) => {
        switch (type) {
            case "text":
                return "Texte";
            case "integer":
                return "Entier";
            case "double":
                return "Double";
            case "checkbox":
                return "Case à cocher";
            case "list":
                return "Liste déroulante";
            case "date":
                return "Date";
            default:
                return "";
        }
    },
    "dialog.add_attribute.list.multiple": "Choix multiple",
    "dialog.add_attribute.list.values": "Valeurs (à séparer par des '|')",
    "dialog.add_attribute.value": "Valeur par défaut (optionnel sauf pour le type Liste)",
    "dialog.add_attribute.value.not_a_valid_integer": "La valeur n'est pas un entier valide",
    "dialog.add_attribute.value.not_a_valid_double": "La valeur n'est pas un double valide",
    "dialog.add_attribute.value.not_a_valid_checkbox": "La valeur doit être 0 ou 1",
    "dialog.add_attribute.value.not_a_valid_date": "La valeur n'est pas une date valide",
    "dialog.add_attribute.type_list_not_empty_error": "La liste de valeurs ne doit pas être vide",
    "dialog.add_attribute.list_duplicates_error": "Il y a des valeurs en double dans la liste",
    "dialog.add_attribute.value_not_in_list_error": "La valeur doit être dans la liste",
    "dialog.add_attribute.description": "Description (optionnel)",
    "dialog.edit_attribute.name": "Nouveau nom",
    "dialog.edit_attribute.name_mandatory_error": "Le nom de l'attribut est obligatoire",
    "dialog.edit_attribute.name_unique_error": "Le nom doit être unique",
    "dialog.edit_attribute.mandatory": "Attribut obligatoire",
    "dialog.edit_attribute.list.multiple": "Choix multiple",
    "dialog.edit_attribute.list.values": "Valeurs (à séparer par des '|')",
    "dialog.edit_attribute.value": "Valeur par défaut (optionnel sauf pour le type Liste)",
    "dialog.edit_attribute.description": "Nouvelle description",
};

export const ThemeEnTranslations: Translations<"en">["Theme"] = {
    add_theme: "Add Theme",
    add_attribute: undefined,
    trimmed_error: undefined,
    attributes_not_conform: undefined,
    modify_theme: ({ text }) => `Modify theme [${text}]`,
    delete_theme: ({ text }) => `Delete theme [${text}]`,
    modify_attribute: ({ text }) => `Modify attribute [${text}]`,
    delete_attribute: ({ text }) => `Delete attribute [${text}]`,
    "dialog.add_theme.name": undefined,
    "dialog.add_theme.name_mandatory_error": undefined,
    "dialog.add_theme.name_unique_error": undefined,
    "dialog.add_theme.help": undefined,
    "dialog.add_theme.help_hint": undefined,
    "dialog.add_theme.link_to_table": undefined,
    "dialog.add_theme.link_to_table_hint": undefined,
    "dialog.add_theme.not_link": undefined,
    "dialog.add_theme.global": undefined,
    "dialog.add_theme.global_hint": undefined,
    "dialog.edit_theme.name": undefined,
    "dialog.edit_theme.name_hint": undefined,
    "dialog.edit_theme.name_mandatory_error": undefined,
    "dialog.edit_theme.name_unique_error": undefined,
    "dialog.edit_theme.help": undefined,
    "dialog.edit_theme.global": undefined,
    "dialog.edit_theme.global_hint": undefined,
    "dialog.add_attribute.name": undefined,
    "dialog.add_attribute.mandatory": undefined,
    "dialog.add_attribute.name_mandatory_error": undefined,
    "dialog.add_attribute.name_unique_error": undefined,
    "dialog.add_attribute.type": undefined,
    "dialog.add_attribute.get_type": ({ type }) => {
        switch (type) {
            case "text":
                return "Text";
            case "integer":
                return "Integer";
            case "double":
                return "Double";
            case "checkbox":
                return "Checkbox";
            case "list":
                return "List";
            case "date":
                return "Date";
            default:
                return "";
        }
    },
    "dialog.add_attribute.list.multiple": undefined,
    "dialog.add_attribute.list.values": undefined,
    "dialog.add_attribute.value": undefined,
    "dialog.add_attribute.value.not_a_valid_integer": undefined,
    "dialog.add_attribute.value.not_a_valid_double": undefined,
    "dialog.add_attribute.value.not_a_valid_checkbox": undefined,
    "dialog.add_attribute.value.not_a_valid_date": undefined,
    "dialog.add_attribute.type_list_not_empty_error": undefined,
    "dialog.add_attribute.list_duplicates_error": undefined,
    "dialog.add_attribute.value_not_in_list_error": undefined,
    "dialog.add_attribute.description": undefined,
    "dialog.edit_attribute.name": undefined,
    "dialog.edit_attribute.name_mandatory_error": undefined,
    "dialog.edit_attribute.name_unique_error": undefined,
    "dialog.edit_attribute.mandatory": undefined,
    "dialog.edit_attribute.list.multiple": undefined,
    "dialog.edit_attribute.list.values": undefined,
    "dialog.edit_attribute.value": undefined,
    "dialog.edit_attribute.description": undefined,
};
