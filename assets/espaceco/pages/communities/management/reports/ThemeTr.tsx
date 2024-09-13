import { declareComponentKeys, Translations } from "../../../../../i18n/i18n";

// traductions
export const { i18n } = declareComponentKeys<
    | "add_theme"
    | { K: "modify_theme"; P: { text: string }; R: string }
    | { K: "delete_theme"; P: { text: string }; R: string }
    | "name"
    | "name_hint"
    | "name_mandatory_error"
    | "name_unique_error"
    | "trimmed_error"
    | "global"
    | "global_hint"
    | "description"
    | "add_attribute"
    | { K: "modify_attribute"; P: { text: string }; R: string }
    | { K: "delete_attribute"; P: { text: string }; R: string }
    | "dialog.add.name"
    | "dialog.add.link_to_table"
    | "dialog.add.link_to_table_hint"
    | "dialog.add.not_link"
    | "dialog.add.help"
    | "dialog.add.help_hint"
>()("Theme");

export const ThemeFrTranslations: Translations<"fr">["Theme"] = {
    add_theme: "Ajouter un thème",
    modify_theme: ({ text }) => `Modifier le thème [${text}]`,
    delete_theme: ({ text }) => `Supprimer le thème [${text}]`,
    name: "Nouveau nom",
    name_hint: "Attention, si vous modifiez le nom du thème, les utilisateurs devront recocher le thème dans leur profil pour y avoir accès.",
    name_mandatory_error: "Le nom du thème est obligatoire",
    name_unique_error: "Le nom doit être unique",
    trimmed_error: "La chaîne de caractères ne doit contenir aucun espace en début et fin",
    global: "Partage",
    global_hint: "Partager ce thème le rendra visible et sélectionnable pour des signalement non liés à des guichets",
    description: "Nouvelle description (optionnel)",
    add_attribute: "Ajouter un attribut",
    modify_attribute: ({ text }) => `Modifier l'attribut [${text}]`,
    delete_attribute: ({ text }) => `Supprimer l'attribut [${text}]`,
    "dialog.add.name": "Nom du thème",
    "dialog.add.link_to_table": "Lier le thème à une base de données et à une table",
    "dialog.add.link_to_table_hint": "Un thème lié à une base de données et à une table ne pourra pas être modifié",
    "dialog.add.not_link": "Ne pas lier à une table",
    "dialog.add.help": "Texte d'aide (optionnel)",
    "dialog.add.help_hint": "Cette description aidera les membres à décrire plus précisément leur signalement",
};

export const ThemeEnTranslations: Translations<"en">["Theme"] = {
    add_theme: "Add Theme",
    modify_theme: ({ text }) => `Modify theme [${text}]`,
    delete_theme: ({ text }) => `Delete theme [${text}]`,
    name: undefined,
    name_hint: undefined,
    name_mandatory_error: undefined,
    name_unique_error: undefined,
    trimmed_error: undefined,
    global: undefined,
    global_hint: undefined,
    description: undefined,
    add_attribute: undefined,
    modify_attribute: ({ text }) => `Modify attribute [${text}]`,
    delete_attribute: ({ text }) => `Delete attribute [${text}]`,
    "dialog.add.name": undefined,
    "dialog.add.link_to_table": undefined,
    "dialog.add.link_to_table_hint": undefined,
    "dialog.add.not_link": undefined,
    "dialog.add.help": undefined,
    "dialog.add.help_hint": undefined,
};
