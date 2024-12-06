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
};
