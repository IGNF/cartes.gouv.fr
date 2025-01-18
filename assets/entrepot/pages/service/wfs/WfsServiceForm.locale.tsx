import { declareComponentKeys } from "i18nifty";
import { Translations } from "../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | { K: "title"; P: { editMode: boolean }; R: string }
    | "stored_data.loading"
    | "stored_data_and_offering.loading"
    | "stored_data.fetch_failed"
    | "offering.fetch_failed"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "previous_step"
    | "continue"
    | "publish"
    | "publish.in_progress"
    | "modify.in_progress"
    | "back_to_data_list"
    | "trimmed_error"
    | "public_name_regex"
    | "tables_info_form.label"
    | "tables_info_form.error.required"
    | "tables_info_form.public_name.label"
    | "tables_info_form.public_name.hint"
    | "tables_info_form.title.label"
    | "tables_info_form.title.hint"
    | { K: "tables_info_form.title.error.required"; P: { table: string }; R: string }
    | "tables_info_form.description.label"
    | "tables_info_form.description.hint"
    | { K: "tables_info_form.description.error.required"; P: { table: string }; R: string }
    | "tables_info_form.keywords.label"
    | "tables_info_form.keywords.hint"
>()("WfsServiceForm");
export type I18n = typeof i18n;

export const WfsServiceFormFrTranslations: Translations<"fr">["WfsServiceForm"] = {
    title: ({ editMode }) => (editMode ? "Modifier le service WFS" : "Créer et publier un service WFS"),
    "stored_data.loading": "Chargement de la donnée stockée...",
    "stored_data_and_offering.loading": "Chargement de la donnée stockée et du service à modifier...",
    "stored_data.fetch_failed": "Récupération des informations sur la donnée stockée a échoué",
    "offering.fetch_failed": "Récupération des informations sur le service à modifier a échoué",
    "step.title": ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Tables";
            case 2:
                return "Source des métadonnées";
            case 3:
                return "Description de la ressource";
            case 4:
                return "Informations supplémentaires";
            case 5:
                return "Restrictions d'accès";
            default:
                return "";
        }
    },
    previous_step: "Étape précédente",
    continue: "Continuer",
    publish: "Publier le service maintenant",
    "publish.in_progress": "Création du service WFS en cours",
    "modify.in_progress": "Modification des informations du service WFS en cours",
    back_to_data_list: "Retour à mes données",
    trimmed_error: "La chaîne de caractères ne doit contenir aucun espace en début et fin",
    public_name_regex:
        "Le nom public de la table ne doit contenir que des lettres, chiffres, tirets (-), underscores (_), ou points (.) et ne peut commencer que par une lettre ou un underscore",
    "tables_info_form.label": "Sélectionnez les tables nécessaires au service",
    "tables_info_form.error.required": "Veuillez choisir au moins une table",
    "tables_info_form.public_name.label": "Nom public de la table (optionnel)",
    "tables_info_form.public_name.hint": "Ce nom permettra d’identifier la table dans les services que vous configurerez, veuillez choisir un nom explicite.",
    "tables_info_form.title.label": "Titre de la table",
    "tables_info_form.title.hint": "Ce titre permet de faciliter l’identification de la table par les utilisateurs.",
    "tables_info_form.title.error.required": ({ table }) => `Le titre de la table ${table} est obligatoire`,
    "tables_info_form.description.label": "Résumé du contenu de la table",
    "tables_info_form.description.hint": "Bref résumé narratif du contenu de la table",
    "tables_info_form.description.error.required": ({ table }) => `Le résumé du contenu de la table ${table} est obligatoire`,
    "tables_info_form.keywords.label": "Mot clés (optionnel)",
    "tables_info_form.keywords.hint": "Utilisez l’auto-complétion ou saisissez librement des mots clés en appuyant sur Entrée après chaque mot",
};

export const WfsServiceFormEnTranslations: Translations<"en">["WfsServiceForm"] = {
    title: undefined,
    "stored_data.loading": undefined,
    "stored_data_and_offering.loading": undefined,
    "stored_data.fetch_failed": undefined,
    "offering.fetch_failed": undefined,
    "step.title": undefined,
    previous_step: undefined,
    continue: undefined,
    publish: undefined,
    "publish.in_progress": undefined,
    "modify.in_progress": undefined,
    back_to_data_list: undefined,
    trimmed_error: undefined,
    public_name_regex: undefined,
    "tables_info_form.label": undefined,
    "tables_info_form.error.required": undefined,
    "tables_info_form.public_name.label": undefined,
    "tables_info_form.public_name.hint": undefined,
    "tables_info_form.title.label": undefined,
    "tables_info_form.title.hint": undefined,
    "tables_info_form.title.error.required": undefined,
    "tables_info_form.description.label": undefined,
    "tables_info_form.description.hint": undefined,
    "tables_info_form.description.error.required": undefined,
    "tables_info_form.keywords.label": undefined,
    "tables_info_form.keywords.hint": undefined,
};
