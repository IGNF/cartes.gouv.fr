import { declareComponentKeys } from "i18nifty";

import { Translations } from "../../../../../i18n/types";

const { i18n } = declareComponentKeys<
    | "title"
    | { K: "step.title"; P: { stepNumber: number }; R: string }
    | "wmsv-service.loading"
    | "wmsv-service.fetch_failed"
    | "wmsv-service.bbox_not_found"
    | "back_to_datasheet"
    | "technical_name.lead_text"
    | "technical_name.label"
    | "technical_name.explanation"
    | "technical_name.error.mandatory"
    | "zoom_range.lead_text"
    | "zoom_range.explanation"
    | "zoom_range.error"
    | "generate.in_progress"
>()("PyramidRasterGenerateForm");
export type I18n = typeof i18n;

export const PyramidRasterGenerateFormFrTranslations: Translations<"fr">["PyramidRasterGenerateForm"] = {
    title: "Générer une pyramide de tuiles raster",
    "step.title": ({ stepNumber }) => {
        switch (stepNumber) {
            case 1:
                return "Nom de la pyramide de tuiles raster";
            case 2:
                return "Niveaux de pyramide";
            default:
                return "";
        }
    },
    "wmsv-service.loading": "Chargement du service WMS-Vecteur...",
    "wmsv-service.fetch_failed": "Récupération des informations sur le service WMS-Vecteur a échoué",
    "wmsv-service.bbox_not_found": "La bbox du service WMS-Vecteur n'a pas été trouvée, veuillez vérifier le service et la donnée stockée utilisée",
    back_to_datasheet: "Retour à la fiche de données",
    "technical_name.lead_text": "Choisissez le nom technique de la pyramide de tuiles raster",
    "technical_name.label": "Nom technique de la pyramide de tuiles raster",
    "technical_name.explanation":
        "II s'agit du nom technique du service qui apparaitra dans votre espace de travail, il ne sera pas publié en ligne. Si vous le renommez, choisissez un nom explicite.",
    "technical_name.error.mandatory": "Le nom technique de la pyramide de tuiles raster est obligatoire",
    "zoom_range.lead_text": "Choisissez les niveaux de pyramide à générer",
    "zoom_range.explanation":
        "Les niveaux de zoom de la pyramide de tuiles raster sont prédéfinis. Choisissez la borne minimum de votre pyramide de tuiles en vous aidant de la carte de gauche et le zoom maximum en vous aidant de la carte de droite. Tous les niveaux intermédiaires seront générés.",
    "zoom_range.error": "Les bornes de la pyramide sont obligatoires.",
    "generate.in_progress": "Génération de pyramide de tuiles raster en cours",
};

export const PyramidRasterGenerateFormEnTranslations: Translations<"en">["PyramidRasterGenerateForm"] = {
    title: undefined,
    "step.title": undefined,
    "wmsv-service.loading": undefined,
    "wmsv-service.fetch_failed": undefined,
    "wmsv-service.bbox_not_found": undefined,
    back_to_datasheet: undefined,
    "technical_name.error.mandatory": undefined,
    "technical_name.lead_text": undefined,
    "technical_name.label": undefined,
    "technical_name.explanation": undefined,
    "zoom_range.lead_text": undefined,
    "zoom_range.explanation": undefined,
    "zoom_range.error": undefined,
    "generate.in_progress": undefined,
};
