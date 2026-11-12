import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | "stored_data.loading"
    | "stored_data.fetch_failed"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "step_tables.error.required"
    | "step_attributes.label"
    | "step_attributes.error.required"
    | "step_zoom_levels.label"
    | "step_zoom_levels.explanation"
    | { K: "step_zoom_levels.error.bounds"; P: { min: number; max: number }; R: string }
    | "step_generalisation.tippecanoe_option.label"
    | "step_generalisation.tippecanoe_option.error.required"
    | "step_sample.label"
    | "step_sample.doubts_prompt"
    | "step_sample.explanation"
    | "step_sample.hint"
    | "step_sample.define_sample"
    | "generate_pyramid"
    | "generate_sample"
    | "pyramid_creation_launch_in_progress"
    | "vector_db.label"
    | "vector_db.placeholder"
    | "vector_db.error.mandatory"
    | "vector_db.list_loading"
    | "technical_name.label"
    | "technical_name.explanation"
    | "technical_name.error.mandatory"
    | "technical_name.error.regex"
    | "no_vector_db.title"
    | "no_vector_db.description"
    | "back_to_datasheet"
>()("PyramidVectorGenerateForm");
export type I18n = typeof i18n;

export const PyramidVectorGenerateFormFrTranslations: Translations<"fr">["PyramidVectorGenerateForm"] = {
    title: "Générer une pyramide de tuiles vectorielles",
    "stored_data.loading": "Chargement de la donnée stockée...",
    "stored_data.fetch_failed": "Récupération des informations sur la donnée stockée a échoué",
    "step.title": ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Tables";
            case 2:
                return "Attributs";
            case 3:
                return "Niveaux de zoom";
            case 4:
                return "Option de généralisation";
            case 5:
                return "Echantillon";
            default:
                return "Etape inconnue";
        }
    },
    "step_tables.error.required": "Veuillez choisir au moins une table",
    "step_attributes.label": "Choisissez les attributs des tables sélectionnées",
    "step_attributes.error.required": "Veuillez choisir au moins un attribut pour chaque table",
    "step_zoom_levels.label": "Choisissez les niveaux de zoom minimum et maximum des tables sélectionnées",
    "step_zoom_levels.explanation":
        "Les niveaux de zoom de la pyramide de tuiles vectorielles sont prédéfinis. Choisissez les bornes minimum et maximum de votre pyramide de tuiles en vous aidant des deux cartes. Tous les niveaux intermédiaires seront générés.",
    "step_zoom_levels.error.bounds": ({ min, max }) => `Les niveaux de zoom doivent être compris entre ${min} et ${max}.`,
    "step_generalisation.tippecanoe_option.label": "Choisissez une option de généralisation",
    "step_generalisation.tippecanoe_option.error.required": "L'option de généralisation est obligatoire",
    "step_sample.label": "Définition d’un échantillon (Optionnel)",
    "step_sample.doubts_prompt": "Des doutes sur votre configuration ?",
    "step_sample.explanation":
        "En choisissant de générer un échantillon, vous pourrez visualiser votre pyramide de tuiles vectorielles sur une zone restreinte et ainsi confirmer votre paramétrage ou le modifier s’il ne vous convient pas. Vous obtiendrez ainsi un résultat plus rapide que si vous générez les tuiles vectorielles sur l’intégralité de vos données.",
    "step_sample.hint":
        "Déplacez la carte ou utilisez l’outil de recherche pour choisir l’emplacement de votre échantillon. Choisissez un endroit où vous êtes certain de trouver des données. La taille de l’échantillon est limité à 10x10 tuiles vectorielles au niveau de zoom maximum que vous avez défini.",
    "step_sample.define_sample": "Définir un échantillon",
    generate_pyramid: "Générer la pyramide complète",
    generate_sample: "Générer l’échantillon",
    pyramid_creation_launch_in_progress: "Demande de création de la pyramide de tuiles en cours ...",
    "vector_db.label": "Base de données vecteur",
    "vector_db.placeholder": "Sélectionnez une base de données",
    "vector_db.error.mandatory": "La base de données vecteur est obligatoire",
    "vector_db.list_loading": "Chargement des bases de données vecteur...",
    "technical_name.label": "Nom technique de la pyramide de tuiles vectorielles",
    "technical_name.explanation": "Nom de la pyramide dans votre espace de travail, il ne sera pas publié en ligne.",
    "technical_name.error.mandatory": "Le nom technique de la pyramide de tuiles vectorielles est obligatoire",
    "technical_name.error.regex":
        "Le nom technique doit commencer par une lettre ou un underscore et ne contenir que des lettres, chiffres, tirets (-), underscores (_) ou points (.)",
    "no_vector_db.title": "Aucune base de données vecteur disponible",
    "no_vector_db.description": "La pyramide de tuiles vectorielles est générée à partir d’une base de données vecteur intégrée de cette fiche de données.",
    back_to_datasheet: "Retour à la fiche de données",
};

export const PyramidVectorGenerateFormEnTranslations: Translations<"en">["PyramidVectorGenerateForm"] = {
    title: undefined,
    "stored_data.loading": undefined,
    "stored_data.fetch_failed": undefined,
    "step.title": undefined,
    "step_tables.error.required": undefined,
    "step_attributes.label": undefined,
    "step_attributes.error.required": undefined,
    "step_zoom_levels.label": undefined,
    "step_zoom_levels.explanation": undefined,
    "step_zoom_levels.error.bounds": undefined,
    "step_generalisation.tippecanoe_option.label": undefined,
    "step_generalisation.tippecanoe_option.error.required": undefined,
    "step_sample.label": undefined,
    "step_sample.doubts_prompt": undefined,
    "step_sample.explanation": undefined,
    "step_sample.hint": undefined,
    "step_sample.define_sample": undefined,
    generate_pyramid: undefined,
    generate_sample: undefined,
    pyramid_creation_launch_in_progress: undefined,
    "vector_db.label": undefined,
    "vector_db.placeholder": undefined,
    "vector_db.error.mandatory": undefined,
    "vector_db.list_loading": undefined,
    "technical_name.label": undefined,
    "technical_name.explanation": undefined,
    "technical_name.error.mandatory": undefined,
    "technical_name.error.regex": undefined,
    "no_vector_db.title": undefined,
    "no_vector_db.description": undefined,
    back_to_datasheet: undefined,
};
